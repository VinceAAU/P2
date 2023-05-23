/**
 * Generates a big CSV file. Specify amount of numbers to generate. 
 * 100 million numbers is slightly below 1 GB. Compile before use.
 * 
 * Usage:
 * `./a.out 100000000 >unsorted.csv`
 * 
 * Usage on Windows:
 * `a.exe 100000000 >unsorted.csv`
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define MAX_NUMBERS_AMOUNT 1000000000

int main(int argc, char** argv) {
    long size = atol(argv[1]);

	clock_t start_time, end_time;
    start_time = clock();

	long* numbers = malloc(MAX_NUMBERS_AMOUNT * sizeof(long));

    srand(time(NULL));   // Initialization, should only be called once.

    long numbers_amount = 0;
    long number;

	while(size != 0) {
        number = rand() % MAX_NUMBERS_AMOUNT;
        numbers[numbers_amount++] = number;
        size--;
    }

	for (long k = 0; k < numbers_amount; k++){
		if (k % 1000 == 0) { // Will result in one number on the first line, but newlines and commas should be handled fine in sorting.
			printf("%ld%s", numbers[k], "\n");
		} else {
			printf("%ld%s", numbers[k], k == (numbers_amount-1) ? "" : ",");
		}
	} // Adding newlines so VSCode can actually open the CSV file (VSCode does not have horizontal virtualization, so it is allergic to large lines. Very sad.).

	end_time = clock();
	double sorting_time = ((double) (end_time - start_time)) / CLOCKS_PER_SEC;
	fprintf(stderr, "Generation completed. Time spent generating: %lf \n", sorting_time);

	return 0;
}
