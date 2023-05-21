/**
 * Sorts a big CSV file. Compile before use.
 * Usage:
 * `./a.out <unsorted.csv >sorted.csv`
 * 
 * Usage on Windows:
 * `a.exe <unsorted.csv >sorted.csv`
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define MAX_NUMBERS_AMOUNT 1000000000

int compare(const void* a, const void* b){
	return ( *(long*)a - *(long*)b );
}

int main(){
	clock_t start_time, end_time;
	long* numbers = malloc(MAX_NUMBERS_AMOUNT * sizeof(long));
	long  numbers_amount = 0;
	char number_buffer[20];
	long i = 0;
	long c;
	while((c = getc(stdin)) != EOF){
		switch(c){
			case '0': case '1': case '2': case '3': case '4':
			case '5': case '6': case '7': case '8': case '9':
				number_buffer[i++] = c;
				break;
			case '\n': case ',':
				number_buffer[i] = 0;
				numbers[numbers_amount++] = atoi(number_buffer);
				i = 0;
				break;
		}
	}

	qsort(numbers, numbers_amount, sizeof(long), &compare);

	for(long k = 0; k < numbers_amount; k++){
		printf("%s%d%s", (k % 1000 == 0) ? "\n" : "", numbers[k], k == (numbers_amount-1) ? "" : ",");
	} // Adding newlines so VSCode can actually open the CSV file (VSCode does not have horizontal virtualization, so it is allergic to large lines. Very sad.).

	end_time = clock();
	double sorting_time = ((double) (end_time - start_time)) / CLOCKS_PER_SEC;
	fprintf(stderr, "Sorting completed. Time spent sorting: %lf \n", sorting_time);

	return 0;
}
