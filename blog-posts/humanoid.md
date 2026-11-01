# Teaching a Unitree G1 Humanoid: GR00T, Cosmos Dreams and Parkour

This project was about training a Unitree G1 humanoid with the current NVIDIA robotics stack, end to end. It has three parts that all feed into each other:

1. **Fine-tuning GR00T N1.7**, NVIDIA's 3B vision-language-action model, on real whole-body teleoperation data with dexterous Inspire hands.
2. **Fine-tuning Cosmos-Predict2.5**, a 2B video world model, so it "dreams" new robot videos from one image and a sentence, plus an **inverse dynamics model** that recovers the robot actions from those videos. This is the GR00T-Dreams / DreamGen idea: generate training data instead of collecting it with teleoperation.
3. **Training locomotion and parkour** for the G1 with PPO in IsaacLab on 16k-20k parallel robots.

Everything was trained on rented A100 and H100 GPUs.

```
first frame + caption  ──►  Cosmos-Predict2.5 (LoRA)  ──►  dream video
                                                               │
                                                               ▼
                                                 inverse dynamics model
                                                               │
                                                               ▼
                                              (state, action) training pairs
                                                               │
                                                               ▼
                                                  GR00T N1.7 fine-tune
```

## 1. Fine-Tuning GR00T N1.7 on a New Embodiment

GR00T N1.7 ships with a G1 configuration, but that one assumes simple binary grippers and extra navigation commands. The Unitree teleop datasets I wanted to use have a **6-DOF Inspire hand** on each side and no navigation commands, so the pretrained action projector simply can't be loaded. I registered a new embodiment and trained a fresh projector together with the 1.1B diffusion transformer action head, keeping the vision-language backbone frozen. That is 1.62B of 3.14B parameters trainable.

The data was six Unitree whole-body teleop datasets:

<div class="table-wrap">
<table>
<thead><tr><th>Task</th><th>Size</th><th>Train episodes</th><th>Val episodes</th></tr></thead>
<tbody>
<tr><td>Pick up pillow</td><td>5.2 GB</td><td>488</td><td>121</td></tr>
<tr><td>Collect clothes</td><td>2.0 GB</td><td>269</td><td>67</td></tr>
<tr><td>Put clothes into washing machine</td><td>3.2 GB</td><td>366</td><td>91</td></tr>
<tr><td>Put drinks into fridge</td><td>8.6 GB</td><td>240</td><td>60</td></tr>
<tr><td>Put clothes into basket</td><td>12 GB</td><td>240</td><td>60</td></tr>
<tr><td>Put vegetables into basket</td><td>20 GB</td><td>240</td><td>60</td></tr>
<tr><td><b>Total</b></td><td><b>51 GB</b></td><td><b>1,843</b> (~847k frames)</td><td><b>459</b></td></tr>
</tbody>
</table>
</div>

Before training, a surprising amount of plumbing was needed: converting the datasets from LeRobot v3 to v2.1 (the only format GR00T's loader reads), decoding AV1 videos that OpenCV can't read, a deterministic 80/20 split done with symlinks so 600 GB of source data didn't get copied, and recomputing the normalization statistics whenever the action horizon changed.

Training ran on one A100 80 GB for about 9.5 hours (AdamW, lr 1e-4, batch 32). It was planned for 60k steps but stopped at 18k when the disk filled up in the middle of saving a checkpoint (each checkpoint is 24 GB with optimizer state). The weights could be recovered.

![GR00T fine-tune loss curve](/robotics/gr00t_loss.png)

The loss drops 30x in the first 4k steps and was still going down when the run stopped.

### Evaluation

I replayed held-out validation episodes and let the model predict 16-step action chunks, then compared to what the human teleoperator actually did. There are two baselines:

- a **random projector** (pretrained backbone + untrained new head, the only "zero-shot" model possible for this hand), and
- **stand still**, i.e. predicting the current pose as the next action, which is surprisingly hard to beat on slow manipulation data.

![Open-loop MSE vs stand-still baseline](/robotics/gr00t_openloop.png)

The fine-tuned model beats the random-projector baseline by **50-66x** and beats the stand-still predictor on **all six tasks** (40-80% of its error). Pillow and basket, the tasks with the most data, are best. Collecting clothes, a bimanual multi-step task with the least data, is the hardest. The hand error is still about 5-10x the body error, which makes sense since the hand head is the only part trained completely from scratch.

An earlier run on the Dex5 hand version of the data also had closed-loop rollouts in MuJoCo, where the model's predictions are fed back as the next state. There the errors compound and are 200-300x larger than open-loop, and the model only barely beats standing still. Closed-loop is where the real difficulty is.

## 2. Cosmos-Predict2.5: Dreaming Robot Videos

The second track was the world model. I LoRA fine-tuned Cosmos-Predict2.5 2B (Video2World, rank 32 on attention and MLP layers of the DiT) on the same G1 videos. The training set was tiny on purpose: 27 clips from three tasks (pillow, clothes, washing machine). The fridge task was held out completely to see if the model generalizes.

Getting the LoRA to load at all needed a patch. Cosmos wraps its layers for activation checkpointing, and the loader did not strip that wrapper prefix from the weight names, so every LoRA target was silently unmatched and the whole DiT started from random weights.

Training ran for 8,000 iterations on one H100 (~3.6 s/iteration, ~296 epochs over the 27 clips). Loss stayed flat around 0.05-0.13, and validation loss at iteration 7000 (0.078) matched training loss, so no overfitting despite the many epochs.

Each video below gets the **same first frame and the same prompt**. Left is the base model, right is my fine-tuned one.

<figure>
<video src="/robotics/cosmos_train_washing.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>Training task: put clothes into the washing machine. The fine-tuned model moves the clothes into the drum with the Inspire hands.</figcaption>
</figure>

<figure>
<video src="/robotics/cosmos_val_fridge.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>Held-out task: put drinks into the fridge. The model never saw a fridge during training.</figcaption>
</figure>

<figure>
<video src="/robotics/cosmos_ood_basket.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>Out-of-distribution: basket scene.</figcaption>
</figure>

<figure>
<video src="/robotics/cosmos_ood_washing.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>Out-of-distribution seed: washing machine.</figcaption>
</figure>

What you can see:

- **Base model:** generic motion, hand poses that don't belong to this robot, and hands that often slip off the object. It has never seen Inspire hands.
- **Fine-tuned:** correct grasp approach, plausible squatting and reaching for objects on the floor, and the six-DOF fingers are visible and move like the real ones.
- **Held-out fridge:** weaker, but the body pose stays realistic and the motion is no longer random. Good enough for filtered data augmentation, not as gold-standard labels.

The earlier fine-tune (on the Dex5-hand data) was tested with harder prompts. These videos are generated from a **single held-out photo plus a sentence**:

<div class="video-grid">
<figure>
<video src="/robotics/dream_pillow_under_table_plain.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>"Pick up the pillow." (pillow lying under a table)</figcaption>
</figure>
<figure>
<video src="/robotics/dream_pillow_under_table_place.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>"Pick up the pillow from under the table and place it on the table."</figcaption>
</figure>
<figure>
<video src="/robotics/dream_ood_cup_pillow.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>"Lift the cup from the table and hold it up." on the pillow scene</figcaption>
</figure>
<figure>
<video src="/robotics/dream_ood_cup_washer.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>Same cup prompt on the washing-machine scene</figcaption>
</figure>
</div>

### Inverse Dynamics: from Dream Videos to Actions

A video alone can't train a robot policy, it needs action labels. For that I trained an **inverse dynamics model** (614M parameters, SigLIP2-large vision encoder + a DiT flow-matching action head). It takes a video chunk, the start state and the instruction and predicts the 41 joint actions (legs, waist, arms and both hands) that produced the motion.

This one was a good lesson in patience. After 6,000 steps the loss sat at 0.95, basically noise level, and the predictions were useless. I almost called it broken. Continuing to 30,000 steps (~3.5 hours on an A100), the loss suddenly broke through around step 15k and ended at 0.13, 7.3x lower.

<div class="table-wrap">
<table>
<thead><tr><th>Joint group</th><th>Error at 6k steps</th><th>Error at 30k steps</th></tr></thead>
<tbody>
<tr><td>Left leg</td><td>14.5°</td><td><b>5.6°</b></td></tr>
<tr><td>Right leg</td><td>15.6°</td><td><b>6.4°</b></td></tr>
<tr><td>Waist</td><td>9.6°</td><td><b>5.0°</b></td></tr>
<tr><td>Left arm</td><td>16.7°</td><td><b>8.5°</b></td></tr>
<tr><td>Right arm</td><td>19.8°</td><td><b>9.7°</b></td></tr>
<tr><td>Left hand</td><td>6.2°</td><td><b>1.5°</b></td></tr>
<tr><td>Right hand</td><td>14.7°</td><td><b>10.0°</b></td></tr>
<tr><td><b>Overall</b></td><td><b>13.9°</b></td><td><b>6.7°</b></td></tr>
</tbody>
</table>
</div>

<figure>
<video src="/robotics/idm_3panel.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>The whole pipeline in one clip. Left: a video dreamed by Cosmos. Middle: the actions the inverse dynamics model recovered from that dream, replayed on a G1 in MuJoCo. Right: the per-joint action values (legs, arms, hands) over time.</figcaption>
</figure>

Legs and waist under 6° are usable. The arms at 8-10° are fine for big reaching motions but too loose for fine manipulation. The full loop (dream video → recovered actions → back into GR00T training) is built, but closing it at scale is the next step.

## 3. Locomotion and Parkour in IsaacLab

Separate from the manipulation work, I trained the G1 to walk over hard terrain with PPO in IsaacLab: 16,384-20,480 robots in parallel on one GPU at ~135k simulation frames per second. The terrain is a curriculum of ten difficulty levels for each of eight tile types: flat, stairs up and down, slopes up and down, boxes, stepping stones and gaps. A robot is promoted to a harder level when it walks far enough and demoted when it fails.

The approach is the standard teacher-student setup. The **teacher** gets privileged information from the simulator (the exact terrain height map, contact forces, true velocity), which a real robot doesn't have. The **student** only sees what the real robot can sense and learns to imitate the teacher.

<figure>
<video src="/robotics/parkour_v28c.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>V28c parkour teacher on the terrain course.</figcaption>
</figure>

<figure>
<video src="/robotics/parkour_v28d_l9.mp4" controls muted loop playsinline preload="metadata"></video>
<figcaption>V28d teacher (with latency, motor-gain and armature randomization for sim-to-real) at iteration 3500, fixed to the hardest terrain level. Rendered to analyse why this run later collapsed.</figcaption>
</figure>

![Teacher vs student terrain level](/robotics/parkour_teacher_student.png)

The teacher trained for 12k iterations and reached a 5.3% fall rate and 0.28 m/s velocity error. The student did not work: it fell 9x as often and never committed to actions. The cause was missing information in its observations (no angular velocity, too short a history). Distillation can't copy behaviour the student can't sense.

Most of the work after that was a long chain of runs (V28 to V54), each changing one thing:

- **V28b**: bigger networks and a critic that also sees foot forces reached the same reward 5x faster, but not a higher ceiling. So the limit was the environment, not model capacity.
- **V28c**: the robot walked with a strange asymmetric gait, one leg hoisted very high. The cause was the reward for long steps (`feet_air_time`) being weighted too high, since nothing in the reward forces left and right to be symmetric. Lowering it fixed the gait and gave the best tracking of the series (0.23 m/s, 0.67 rad/s).
- **V28d**: added sim-to-real randomization (control latency of 0-40 ms, ±20% motor gains, armature) and a penalty on fast torque changes. That penalty became dominant on hard terrain, the policy learned that "don't move" was best, and reward collapsed by 79%.
- **V28e-g**: a mixture-of-experts actor converged to a deep crouching duck walk. **V28n** with a plain network fixed it, so the MoE was the cause.
- **V28o**: found three bugs in the terrain curriculum itself. For example, robots told to stand still could never be promoted, and IsaacLab's stock curriculum wraps robots at the max level back to a random level instead of keeping them there.

![Terrain level per tile type](/robotics/parkour_tiles.png)

After those fixes the policy maxes out flat ground, stairs, uphill slopes and boxes, and gets far on downhill slopes and stepping stones. Gaps stayed the hard problem: you can't walk over a gap with a normal gait, you have to learn to step over it, and the curriculum never got the robot to that skill. That is what the later runs worked on.

## What I Took Away

- Fine-tuning a large VLA for a new hand is mostly data and plumbing work. The training itself was the easy part.
- A "stand still" baseline is essential for manipulation. Many numbers look good until you compare against it.
- Closed-loop evaluation is far harsher than open-loop. Open-loop alone will lie to you.
- Video world models fine-tune well even on 27 clips and can generate useful synthetic data for tasks never seen.
- Models can sit at the noise floor for a long time and then suddenly learn (the inverse dynamics model at 15k steps).
- In RL, most of the failures were reward shaping and curriculum bugs, not the algorithm or the network size.
