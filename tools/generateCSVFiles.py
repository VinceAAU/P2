#!/usr/bin/python3
import csv
import random
import threading

# Set the file name and the number of rows and columns
file_name = "random_numbers_average.csv"
num_rows = 100
num_cols = 10_000_000

# Create a lock to synchronize access to the file
lock = threading.Lock()

# Define a worker function that generates random integers and writes them to the file
def worker():
    with lock:
        with open(file_name, "a", newline="") as csvfile:
            writer = csv.writer(csvfile)
            row = [random.randint(0, 1_000_000_000) for j in range(num_cols)]
            writer.writerow(row)

# Create a list of worker threads and start them
threads = []
for i in range(num_rows):
    thread = threading.Thread(target=worker)
    thread.start()
    threads.append(thread)

# Wait for all threads to finish
for thread in threads:
    thread.join()

print("Random numbers written to file:", file_name)