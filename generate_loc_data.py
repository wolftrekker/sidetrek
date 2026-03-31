"""
Regenerate loc_data.json from QGIS CSV exports.
 
Usage:
    python generate_loc_data.py csv-nations.csv csv-subd.csv
 
Outputs:
    loc_data.json (in the current directory)
 
Workflow:
    1. Update your data in QGIS
    2. Export nation layer as CSV → csv-nations.csv
    3. Export subdivision layer as CSV → csv-subd.csv
    4. Run this script
    5. Push loc_data.json to your repo
"""
 
import csv
import json
import sys
import os
 
 
def generate(nations_csv, subd_csv, output='loc_data.json'):
    loc_data = {
        'nations': {},
        'subdivisions': {},
        'country_totals': {}
    }
 
    # Read nations
    with open(nations_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['unit_name'].strip()
            loc_data['nations'][name] = {
                'iso_a2': row['iso_a2'].strip(),
                'loc_count': int(row['loc_count'].strip())
            }
 
    # Read subdivisions, grouped by iso_a2
    with open(subd_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            iso = row['iso_a2'].strip()
            name = row['unit_name'].strip()
            count = int(row['loc_count'].strip())
 
            if iso not in loc_data['subdivisions']:
                loc_data['subdivisions'][iso] = {}
            loc_data['subdivisions'][iso][name] = count
 
    # Calculate country totals
    for iso, subds in loc_data['subdivisions'].items():
        loc_data['country_totals'][iso] = sum(subds.values())
 
    # World total
    world_total = sum(loc_data['country_totals'].values())
 
    # Write JSON
    with open(output, 'w', encoding='utf-8') as f:
        json.dump(loc_data, f, ensure_ascii=False, indent=2)
 
    print(f'Generated {output}')
    print(f'  Nations:      {len(loc_data["nations"])}')
    print(f'  Subdivisions: {sum(len(v) for v in loc_data["subdivisions"].values())}')
    print(f'  World total:  {world_total:,}')
 
 
if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python generate_loc_data.py <nations.csv> <subd.csv>')
        sys.exit(1)
 
    generate(sys.argv[1], sys.argv[2])