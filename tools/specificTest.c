#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define MAX_NUMBERS_AMOUNT 1000000000

int compare(const void* a, const void* b){
	return ( *(long*)a - *(long*)b );
}

int main() {
    long size = 25000000; // Number of elements in the array to be sorted.

	long* numbers = malloc(MAX_NUMBERS_AMOUNT * sizeof(long));

    srand(time(NULL));   // Initialization, should only be called once.

    long numbers_amount = 0;
    long number;

	while(size != 0) {
        number = rand() % MAX_NUMBERS_AMOUNT;
        numbers[numbers_amount++] = number;
        size--;
    }

	clock_t start_time, end_time;
    start_time = clock();

    qsort(numbers, numbers_amount, sizeof(long), &compare);

	end_time = clock();

    printf("\nFirst 100 elements: \n");

    for (int i = 0; i < 100; ++i) {
        if (i % 10 == 0) {
            printf("\n");
        } else {
            printf("%ld%s", numbers[i], i == 99 ? "" : ",");
        }
    }

	double sorting_time = ((double) (end_time - start_time)) / CLOCKS_PER_SEC;
	printf("\n\nGeneration completed. Time spent generating: %lf \n\n", sorting_time);

	return 0;
}
