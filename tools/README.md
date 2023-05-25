Project tools
===
This directory contains some of the tools used during the project.


generateCSV.c
---
This tool generates a large CSV file. 
It takes in the amount of numbers to generate as an argument, and writes the CSV file into stdout.

Example:

    ./a.out 100000000 >unsorted.csv

Will generate a file with 100 million elements and write it to a file named `unsorted.csv`.
Such a file will be slightly below 1 GB in size.

If the range needs to be altered, this can be done in the source with the macro `MAX_NUMBERS_AMOUNT`


jsSortingBenchmark.js
---
This scripts generates a large array of numbers, and then sorts them.
This script can be run as:

    node jsSortingBenchmark.js

specificTest.c
---
This tool generates a large array of numbers, and then sorts them.
This tool does not take any arguments.


singleComputerBenchmark.c
---
This program reads a CSV file through stdin, and writes those numbers sorted into stdout.

Example:

    ./a.out <unsorted.csv >sorted.csv

Will read the values of `unsorted.csv`, sort them, and output those values into `sorted.csv`.

It is worth mentioning that this program outputs a newline every 1000 elements so certain code editors can open it. The product does not do this, so their outputs cannot be directly compared for verification.


