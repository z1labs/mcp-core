import { performance } from 'perf_hooks'; // Node.js only, for browsers, this is global

export class PerformanceTracker {
  private checkpoints: { label: string; time: number }[] = [];
  private labelCounts: Record<string, number> = {}; // To track duplicate labels

  constructor() {
    this.checkpoints = [];
    this.labelCounts = {};
  }

  mark(label: string): void {
    // Handle duplicate labels by appending a unique count
    if (!this.labelCounts[label]) {
      this.labelCounts[label] = 0;
    }
    const count = ++this.labelCounts[label];
    const uniqueLabel = count > 1 ? `${label} (${count})` : label;

    const time = performance.now();
    this.checkpoints.push({ label: uniqueLabel, time });
    console.log(`${uniqueLabel}: ${time.toFixed(2)} ms`);
  }

  logDurations(): void {
    if (this.checkpoints.length < 2) {
      console.log('Not enough checkpoints to calculate durations.');
      return;
    }

    console.log('Durations between checkpoints:');
    for (let i = 1; i < this.checkpoints.length; i++) {
      const duration = this.checkpoints[i].time - this.checkpoints[i - 1].time;
      console.log(
        `From "${this.checkpoints[i - 1].label}" to "${this.checkpoints[i].label}": ${duration.toFixed(2)} ms`,
      );
    }
    const totalDuration = this.checkpoints[this.checkpoints.length - 1].time - this.checkpoints[0].time;
    console.log(`Total time: ${totalDuration.toFixed(2)} ms`);
  }
}
