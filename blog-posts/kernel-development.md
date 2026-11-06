# GPU Kernel Optimization with AI Agents: The Open Kernel Challenge

**148th of 2,014 participants (top 7.3%), while seriously pursuing only 2 of the 5 problems.** The other three mostly ran on public engines with light tuning.

<div class="table-wrap">
<table>
<thead><tr><th>Problem we pursued</th><th>Speedup</th><th>Rank</th><th>Top</th><th>Behind the winner</th></tr></thead>
<tbody>
<tr><td>BF16 projection</td><td>1.610x</td><td>43 of 1,747</td><td><strong>2.5%</strong></td><td><strong>6.8%</strong> (winner 1.728x)</td></tr>
<tr><td>MoE</td><td>2.512x</td><td>60 of 1,426</td><td><strong>4.2%</strong></td><td><strong>11.7%</strong> (winner 2.844x)</td></tr>
</tbody>
</table>
</div>

The Muse Spark Open Kernel Challenge asked participants to speed up five inference kernels on an NVIDIA H200. A judge measures the real speedup against a stock baseline and checks that the results stay correct.

The work was done by about 40 AI coding agents under my direction, sharing one rented H200. My part was setting direction, reviewing evidence and deciding what to pursue.

![Score over time for MoE and BF16](/kernels/progress.png)

These are the board values when the kernel track closed, and the organizers could still revise them. Each one is the best of several noisy runs: the same MoE file scored between 2.451 and 2.512.

## What was ours and what wasn't

The submitted kernels build on public engines from other participants, mainly alygg77, with tuning on top. Adopting those engines caused the big jump on the first night.

Our own work was:

- **`kdev`**, a toolkit that gives agents one interface for building, testing, timing and analyzing kernels, built with AI agents during the challenge.
- **MoE engines for small batch sizes.** Together with tuning the public engine for large sizes, they raised MoE from 2.366 to a repeat-check level of about 2.49.
- **BF16 tuning.** Tuning the public engine raised BF16 from 1.539 to a repeat-run level of about 1.60.
- **Hardware measurements** that showed where the time was going.

## kdev

Agents are good at trying ideas and bad at noticing when their benchmark is wrong. We lost several days to results that turned out to be invalid, so `kdev` makes the correct setup the default:

- **Timing you can compare:** the judge's toolchain, a read flush of L2, CUDA graph replay, interleaved A/B with confidence intervals, and an exclusive GPU lock.
- **Output sized for agents:** a verdict in about 40 lines plus a run ID, with full data available in pages.
- **Shared memory:** a ledger answers "has this already been tried?", and a board handles claims and findings between agents.

## What went wrong

**The benchmark was lying.** A local build with nvcc 12.8 serialized a kernel that the judge's CUDA 13 build did not, which made it look 27% slower (491 vs 357 µs) and flipped a design decision. Our harness also flushed the cache by writing instead of reading, which added 1–2.5 µs to small kernels. Five fixed routing seeds made one candidate look 3 µs faster when it was really 6 µs slower.

**"At the limit" was a guess.** Agents reported kernels as near their floor, and I accepted it. The gains were there in cheap knobs and in hot-loop instructions nobody had read. A floor claim now needs the disassembly accounted for first.

**Rewrites lost to measurement.** Three ground-up MoE kernels failed, and the best reached only 0.70x of the best file. All three relied on a simple bandwidth model, and fitting time against expert count showed what it hid: one design had a 27–29 µs fixed cost, and another lost on every byte because compute didn't overlap with the memory stream. Setting one-hour kill gates in advance ended each of them cleanly.

**More agents wasn't more progress.** Successors inherited conclusions like "dead" without the numbers behind them. Evidence had to outlast the agent, so notes record the exact variant, method and numbers. One test also ran 1/40 of the calls it claimed and exited 0 when it printed FAIL, and only an independent source review caught it.

## What the H200 measurements showed

- Weight streaming follows `T = 1.7 µs + bytes / 4.62 TB/s`, and no access pattern on real weights beat about 4.7 TB/s.
- The best compute core reached 6.91 TB/s-equivalent at N = 8, falling to about 2.0 at N = 128, where the tensor units become the limit.
- Each extra small graph node costs about 1.7 µs, and a dependent cold DRAM round trip about 0.65 µs. Cold data-TLB misses cost almost nothing, so page-touch tricks never helped.
