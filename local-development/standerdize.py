#!/bin/python3

## open databases/postgres/datasets/dump.sql
## read the file line by line because it is too large to read all at once
## for each line that starts with "INSERT INTO public.dreapp_document" change the forward_slashes in the 4th field to underscores

def process_sql_file(input_file_path, output_file_path):
    with open(input_file_path, 'r') as infile, open(output_file_path, 'w') as outfile:
        for line in infile:
            if line.startswith("INSERT INTO public.dreapp_document VALUES ("):
                parts = line.split(',')
                if len(parts) > 3:
                    parts[3] = parts[3].replace('/', '_')
                    line = ','.join(parts)
            outfile.write(line)

input_file_path = "databases/postgres/datasets/dump.sql"
output_file_path = "databases/postgres/datasets/updated.sql"

process_sql_file(input_file_path, output_file_path)