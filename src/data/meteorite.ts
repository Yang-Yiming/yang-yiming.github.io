// Experiment log for the STA326 meteorite-identification project.
//
// Every entry is one test submission, in order: `score` is its binary F1 on the
// 194-image test set. The old stage ran before the midterm, the new stage after.
// Submission numbers, running bests and "new best" flags are derived below.

export interface Submission {
  name: string;
  score: number;
}

export interface Experiment extends Submission {
  /** Submission index (1-based). */
  x: number;
  /** Running best F1 up to and including this submission. */
  best: number;
  /** Whether this submission set a new best. */
  kept: boolean;
}

export interface ExperimentChartData {
  title: string;
  data: Experiment[];
  /** Last submission of the old stage; draws the before/after-midterm divider. */
  splitAt: number | null;
}

const OLD: Submission[] = [
  { name: "split baseline", score: 0.64516 },
  { name: "top-3 soup submit", score: 0.69856 },
  { name: "seed ensemble", score: 0.65968 },
  { name: "mytest split", score: 0.65979 },
  { name: "mytest pretrain", score: 0.55214 },
  { name: "mytest aug", score: 0.67021 },
  { name: "split-val aug", score: 0.63212 },
  { name: "small + mytest", score: 0.65263 },
  { name: "reduced not-stone", score: 0.71962 },
  { name: "restore 4 IDs", score: 0.71559 },
  { name: "top5 FP-risk zero", score: 0.7177 },
  { name: "zero 108/124/131", score: 0.7109 },
  { name: "frozen triple probe", score: 0.68224 },
  { name: "DINOv2 base", score: 0.70697 },
  { name: "DINOv2 small", score: 0.71962 },
  { name: "6-fold ensemble", score: 0.67924 },
  { name: "BN-adapt consensus", score: 0.72985 },
  { name: "surgical patch", score: 0.73429 },
  { name: "manual/web patch", score: 0.74146 },
  { name: "aggressive patch", score: 0.74747 },
  { name: "restore100+066", score: 0.74747 },
  { name: "restore 100=0", score: 0.75126 },
  { name: "zero 186/006/086/124", score: 0.74611 },
  { name: "zero 086/186", score: 0.74871 },
];

const NEW: Submission[] = [
  { name: "SAM-mask AdamW", score: 0.54237 },
  { name: "SAM-mask SGD", score: 0.56889 },
  { name: "bbox AdamW 35ep", score: 0.63953 },
  { name: "bbox AdamW 65ep", score: 0.65432 },
  { name: "bbox top-3 soup", score: 0.65193 },
  { name: "bbox SGD", score: 0.69159 },
  { name: "+nomask originals", score: 0.70051 },
  { name: "mytest w=0.1", score: 0.69369 },
  { name: "old SOTA rerun", score: 0.70222 },
  { name: "mytest w=0.5", score: 0.66292 },
  { name: "TTA 4way", score: 0.68966 },
  { name: "seed123", score: 0.68817 },
  { name: "masked crop", score: 0.73684 },
  { name: "masked last", score: 0.71818 },
  { name: "white bg", score: 0.71429 },
  { name: "masked epoch10", score: 0.70435 },
  { name: "blr=5e-4", score: 0.69869 },
  { name: "white drop0", score: 0.69264 },
  { name: "white last", score: 0.68421 },
  { name: "long T0=20 ep40", score: 0.72072 },
  { name: "long T0=20 ep18", score: 0.71963 },
  { name: "long last", score: 0.66935 },
  { name: "black-test inference", score: 0.72072 },
  { name: "texture valid_patch", score: 0.73832 },
  { name: "seed256", score: 0.73239 },
  { name: "blr=4e-4", score: 0.72449 },
  { name: "blr=2e-4", score: 0.71233 },
  { name: "texture ep28", score: 0.7122 },
  { name: "no label smoothing", score: 0.7109 },
  { name: "restart T0=15", score: 0.70968 },
  { name: "cutmix 0.5", score: 0.70852 },
  { name: "mixup 0.5", score: 0.70769 },
  { name: "seed123 rerun", score: 0.70742 },
  { name: "texture TTA4", score: 0.73733 },
  { name: "texture TTA8", score: 0.73733 },
  { name: "tex+s256 equal", score: 0.75862 },
  { name: "tex+baseline", score: 0.75829 },
  { name: "tex+base+s256", score: 0.75701 },
  { name: "base+s256", score: 0.73892 },
  { name: "tex+s256 weighted", score: 0.76923 },
  { name: "tex+base weighted", score: 0.76056 },
  { name: "3-way weighted", score: 0.76923 },
  { name: "tex_cutmix", score: 0.74112 },
  { name: "seed1", score: 0.72489 },
  { name: "AdamW variant", score: 0.72043 },
  { name: "RandAugment", score: 0.71552 },
  { name: "tex seed256", score: 0.70899 },
  { name: "seed999", score: 0.70755 },
  { name: "big patch", score: 0.70339 },
  { name: "small patch", score: 0.68889 },
  { name: "tc+tex+s256", score: 0.77228 },
  { name: "tex+AdamW", score: 0.77157 },
  { name: "tc+tex+s256 equal", score: 0.76847 },
  { name: "multi-patch 4", score: 0.721 },
  { name: "multi-patch 8", score: 0.717 },
  { name: "multi-patch black", score: 0.677 },
  { name: "tc soup", score: 0.711 },
  { name: "rpt8 tiny", score: 0.72549 },
  { name: "rpt2 tiny", score: 0.69841 },
  { name: "rpt4 tiny", score: 0.69159 },
  { name: "small rpt2", score: 0.75455 },
  { name: "base rpt3", score: 0.67857 },
  { name: "ConvNeXt V2", score: 0.66932 },
  { name: "ConvNeXt V2 cutmix", score: 0.675 },
  { name: "sm+tc+tex+s256", score: 0.77885 },
  { name: "tc+tex+s256 v2", score: 0.77228 },
  { name: "sm+tex", score: 0.76684 },
  { name: "exhaustive ensemble", score: 0.78788 },
  { name: "small rpt2 restart ep10", score: 0.79365 },
  { name: "small rpt2 restart ep30", score: 0.77512 },
  { name: "small rpt4 restart", score: 0.76415 },
  { name: "final 3-model ensemble", score: 0.81633 },
];

function track(submissions: Submission[]): Experiment[] {
  let best = -Infinity;
  return submissions.map((submission, index) => {
    const kept = submission.score > best;
    if (kept) best = submission.score;
    return { ...submission, x: index + 1, best, kept };
  });
}

export const experimentCharts = {
  old: { title: "Old-stage Experiment Progress", data: track(OLD), splitAt: null },
  new: { title: "New-stage Experiment Progress", data: track(NEW), splitAt: null },
  combined: { title: "Full Project Experiment Progress", data: track([...OLD, ...NEW]), splitAt: OLD.length },
} satisfies Record<string, ExperimentChartData>;

export type ExperimentChartName = keyof typeof experimentCharts;
