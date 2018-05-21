#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>

// gcc -lm -Ofast springs.c && ./a.out
// Time taken 9 seconds 939 millisecondssum = 3302.935225

int main() {
  const int n = 4096;
  double res[n * 2];
  for (int i=0; i<n*2; i++) {
    res[i] = fmod(fabs(sin(i * 1.0) * 1000.0), 1.0);
  }

  double sum = 0;

  sum = 0;
  for (int i=0; i<n*2; i++) {
    sum += res[i] * res[i];
  }
  printf("sum = %f\n", sum);

  for (int iter=0; iter < 10; iter++) {
    clock_t start = clock(), diff;
    for (int i=0; i<n*2; i+=2) {
      double x1 = res[i];
      double y1 = res[i + 1];
      for (int j=0; j<n*2; j+=2) {
        if (j <= i) continue;
        double x2 = res[j];
        double y2 = res[j + 1];
        double dx = x2 - x1;
        double dy = y2 - y1;
        double dist = sqrt(dx * dx + dy * dy);
        double force = log(dist / 0.5) * 0.00001;
        double ddx = dx / dist * force;
        double ddy = dy / dist * force;
        res[i] += ddx;
        res[i + 1] += ddy;
        res[j] -= ddx;
        res[j + 1] -= ddy;
      }
    }
    diff = clock() - start;
    int msec = diff * 1000 / CLOCKS_PER_SEC;
    printf("%d.%d\n", msec/1000, msec%1000);
  }

  // printf("Time taken %d seconds %d milliseconds", msec/1000, msec%1000);

  sum = 0;
  for (int i=0; i<n*2; i++) {
    sum += res[i] * res[i];
  }
  printf("sum = %f\n", sum);
  
  return 0;
}
