/**
 * Sorts a big CSV file.
 * Usage:
 * `./a.out <unsorted.csv >sorted.csv`
 */

#include <stdio.h>
#include <stdlib.h>

#define MAX_NUMBERS_AMOUNT 1000000000

int compare(int* a, int* b){
	return *a-*b;
}

int main(){
	int* numbers = malloc(MAX_NUMBERS_AMOUNT * sizeof(int));
	long  numbers_amount = 0;
	char number_buffer[20];
	int i = 0;

	int c;
	while((c = getc(stdin))!=EOF){
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

	qsort(numbers, numbers_amount, sizeof(int), &compare);

	for(int i = 0; i < numbers_amount; i++){
		printf("%d%s", numbers[i], i==(numbers_amount-1)?"":",");
	}

	return 0;
}
