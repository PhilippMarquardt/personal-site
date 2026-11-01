# Everdream

Everdream is my playground repository for everything around training models end to end. It started as a small pre-training codebase and grew into one place for pre-training, RL post-training, evaluation, robot simulation and LLM architecture research. The idea is that every phase shares the same evaluation suite, so a pretrained checkpoint, an RL fine-tuned model and a HuggingFace model can all be scored with the same YAML config.

The repository has these main parts:

- `everdream/pretraining`: a nanochat-style distributed trainer (FP8, FlashAttention 3, weighted parquet data mixing)
- `everdream/posttraining`: RL post-training with GRPO via TRL and pluggable verifiable rewards
- `everdream/evaluation`: phase-agnostic eval suites where the verifiers are shared with the RL rewards
- `everdream/sim`: MuJoCo / MuJoCo Warp drone simulation and reinforcement learning
- `archlab`: a small harness for LLM architecture experiments

## RL Post-Training

The post-training part trains Qwen models with GRPO on tasks where the answer can be verified automatically. Some results with Qwen3-1.7B:

- GSM8K: 75.5% -> 85.0% at step 300. After the peak the accuracy decays again, so choosing the checkpoint on a held-out set is mandatory.
- Banking77 (77-way intent classification): 16.5% -> 62% with pure RL and no supervised data
- MedCalc: 17% -> 29.5% in 200 steps

The long-term direction for this part is a medical RL framework with MedCalc as the first task.

## Drone Simulation

The second big part is a drone simulator. It started as a procedural MuJoCo flight arena with terrain, buildings, trees, gates, weather (wind shear, gusts, turbulence) and keyboard RC control for one or many drones. On top of that I trained several policies for a PX4 X500 quadrotor:

- **Landing**: PPO with weather and gust curriculum, 86.7% successful landings with 0.137 m mean touchdown error
- **Low-level flight skill**: a policy that controls the four motors directly and follows velocity commands. It also transferred zero-shot to a Unity version of the drone (8/8 successful runs, 0.17 m/s velocity RMSE).

The biggest lesson here was the simulator speed. Stepping 12 CPU worlds one after another with Stable-Baselines was far too slow, so I moved to MuJoCo Warp, which runs 16,384 drone worlds in parallel on a single RTX 5070 Ti at 24.5 million physics steps per second. The whole PPO loop stays on the GPU.

With this I trained a room navigation policy in a 3x3 grid of rooms. A planner chooses the doorways, the learned policy outputs waypoints at 10 Hz and a controller flies them. Results on a fixed evaluation set:

- Success rate: 98.4% with 16 range sensors, **100%** with 64 (target >= 90%)
- Collision rate: 1.6% / **0.0%** (target <= 2%)
- SPL (how close the path is to the shortest one): 0.984 / **1.000** (target >= 0.75)
- Mean speed: 2.37 m/s for both (target >= 1.5 m/s)

Without fine-tuning it still reaches 97.5% on 20 unseen building layouts and 97.9% on a bigger 4x4 grid with longer routes than seen in training. The only real failure were narrow 1.2 m doorways (66%). It turned out the 16 range sensors returned identical readings for a 1.2 m and a 1.8 m doorway at 3-4 m distance, so the policy was simply blind to the difference, which is why the 64 ray version was trained.

## LLM Architecture Research (archlab)

The newest part is `archlab`, a small harness to compare transformer architectures where every variant is a one-flag change on a modern baseline (RMSNorm, RoPE, QK-norm, ReLU², logit softcap) and trained with Muon + Adam on FineWeb. Currently there are 13+ architectures in it, e.g. GQA, MLA, MoE, nGPT, differential attention, looped transformers and encoder-decoders. Small runs are done locally and the bigger grids on rented H100s, where the 30M model trains at about 740k tokens/s.

```bash
python train.py --arch loop_add --loop-iters 4 --dim 512 --tokens 504e6 --seed 0 --out runs/loop_add
```

### Experiment 1: Looped Transformers

The question was how to feed the input back into a transformer that loops its middle layers (4 iterations) at 30M parameters and 504M tokens, 3 seeds each:

Validation loss, mean of 3 seeds:

- modern baseline: 3.734
- loop_add (additive re-injection): **3.708**
- loop_parcae (contractive injection): 3.718
- loop adapter (concat + projection): 3.902

Additive re-injection beats the baseline on all three seeds. The adapter version I expected to be fine is 0.17 nats worse, since its non-residual projection drifts away from the identity during training.

### Experiment 2: Flow-Matched Draft of the Future

Here the model predicts a window of 8 future tokens with a small flow-matching head and feeds that draft back into the stream. To know how much there is to gain, an oracle version gets the true future tokens:

- modern baseline: 3.736
- flow draft: 3.722
- multi-token prediction: 3.719
- oracle (true future): **3.486**

So there is a 0.25 nat ceiling, but the gain of the flow draft only came from the auxiliary loss. The model learned to gate the sampled draft to zero, because a sampled draft was worse than no draft at all (sample MSE 1.13 vs 1.01 for a trivial prediction).

### Experiment 3: Encoder-Decoder with a Memory Bank

Next I tried a bidirectional looped encoder with a bank of 32 learned memory slots, read by a small decoder. On a synthetic multi-hop lookup task (3 seeds) this works really well:

Accuracy for 1 / 2 / 3 / 4 hops:

- decoder-only: 1.00 / 0.96 / 0.82 / 0.59
- encoder-decoder: 1.00 / 1.00 / 0.99 / 0.96
- encoder-decoder with 4 encoder loops: 1.00 / 1.00 / 1.00 / 1.00

The bidirectional encoder solves compositions the decoder-only model can't, and the loops close the last gap. For actual language modeling it looks different. At 124M parameters and 250M tokens:

![Experiment C/D loss curves](/everdream.png)

Validation loss (perplexity):

- decoder-only baseline: **3.941** (51.5)
- prefix-LM: 4.125 (61.9)
- encoder-decoder, 4 loops, decoder reads only the 32 slots: 4.139 (62.7)
- encoder-decoder: 4.165 (64.4)
- encoder-decoder + encoder MLM loss: 4.375 (79.4)

Every design with a bidirectional prefix is 0.18-0.25 nats behind the plain causal model at this budget. The interesting part is that inside the encoder-decoder family, forcing the decoder to only read the 32 memory slots works better than letting it read all 512 encoder tokens, so the slots actually compress the context.

Everything is logged per run (`log.jsonl` + `summary.json`), so negative results are kept just like the positive ones.
