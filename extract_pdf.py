import pdfplumber
import json
import csv

pdf_path = "AP EAPCET LAST YEAR CUT OFF RANKS.pdf"

all_rows = []
header = None

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        if tables:
            for table in tables:
                for j, row in enumerate(table):
                    # Clean row - remove newlines
                    cleaned = [str(cell).replace('\n', ' ').strip() if cell else '' for cell in row]
                    
                    # Check if header row
                    if 'SNO' in cleaned[0] or 'INSTCODE' in str(cleaned[1]):
                        if not header:
                            header = cleaned
                        continue
                    
                    # Skip empty rows
                    if not cleaned[0] or cleaned[0] == 'None':
                        continue
                    
                    all_rows.append(cleaned)

print(f"Header columns ({len(header)}): {header}")
print(f"Total data rows: {len(all_rows)}")
print(f"\nFirst 3 rows:")
for r in all_rows[:3]:
    print(f"  Cols: {len(r)} -> {r[:12]}...")
print(f"\nLast 3 rows:")
for r in all_rows[-3:]:
    print(f"  Cols: {len(r)} -> {r[:12]}...")

# Get unique values for key columns
colleges = set()
branches = set()
types = set()
districts = set()

for row in all_rows:
    if len(row) > 11:
        colleges.add(row[2])
        types.add(row[3])
        districts.add(row[5])
        branches.add(row[11])

print(f"\nUnique colleges: {len(colleges)}")
print(f"Unique branches: {sorted(branches)}")
print(f"Unique types: {sorted(types)}")
print(f"Unique districts: {sorted(districts)}")

# Write to CSV for later use
clean_header = ['SNO', 'INSTCODE', 'NAME', 'TYPE', 'INST_REG', 'DIST', 'PLACE', 'COED', 'AFFL', 'ESTD', 'A_REG', 'BRANCH_CODE',
                'OC_BOYS', 'OC_GIRLS', 'SC_BOYS', 'SC_GIRLS', 'ST_BOYS', 'ST_GIRLS',
                'BCA_BOYS', 'BCA_GIRLS', 'BCB_BOYS', 'BCB_GIRLS', 'BCC_BOYS', 'BCC_GIRLS',
                'BCD_BOYS', 'BCD_GIRLS', 'BCE_BOYS', 'BCE_GIRLS', 'EWS_BOYS', 'EWS_GIRLS', 'COLLEGE_FEE']

with open('cutoff_data_raw.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(clean_header)
    for row in all_rows:
        # Pad row if needed
        while len(row) < len(clean_header):
            row.append('')
        writer.writerow(row[:len(clean_header)])

print(f"\nCSV saved: cutoff_data_raw.csv")
