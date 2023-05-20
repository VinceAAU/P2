# NOTICE: IMPORTANT:
# THIS PYTHON SCRIPT WAS PRODUCED BY GPT 4.
# THIS WAS DONE WITH THE PURPOSE OF TESTING OUR PRODUCT
# AGAINST SOMETHING WE DID NOT CREATE OURSELVES, 
# THAT FUNCTIONS SIMILARLY.

import csv
import time

# Read the file
def read_file(file_name):
    with open(file_name, 'r') as file:
        reader = csv.reader(file)
        data = [int(item) for sublist in reader for item in sublist]
    return data

# Write to the file
def write_file(file_name, data):
    with open(file_name, 'w', newline='') as file:
        writer = csv.writer(file)
        for val in data:
            writer.writerow([val])

# Main function
def main():
    start_time = time.time()
    # Read the file
    data = read_file('random_numbers_90.csv') # Specify file path for the unsorted file here. (in the tools folder)
    # Sort the data
    data.sort()
    # Write to the file
    write_file('output.csv', data)
    end_time = time.time()
    print(f'The script took {end_time - start_time} seconds to run.')

if __name__ == "__main__":
    main()
