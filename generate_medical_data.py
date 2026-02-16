
import pandas as pd
import numpy as np
from faker import Faker
import uuid
import random
from datetime import datetime, timedelta

# Initialize Faker
fake = Faker()

# Configuration
NUM_RECORDS = 1000
OUTPUT_DIR = "medical_predictive_data"

# Mock Medical Data Lists for realism
DIAGNOSES = [
    ('I50.9', 'Heart Failure, Unspecified'), ('E11.9', 'Type 2 Diabetes w/o complications'),
    ('J18.9', 'Pneumonia, Unspecified'), ('N18.9', 'Chronic Kidney Disease, Unspecified'),
    ('A41.9', 'Sepsis, Unspecified'), ('I10', 'Essential Hypertension'),
    ('J44.9', 'COPD, Unspecified'), ('F32.9', 'Major Depressive Disorder'),
    ('M54.5', 'Low Back Pain'), ('K21.9', 'GERD')
]

VITALS = [
    ('Heart Rate', 'bpm', 60, 100), ('Systolic BP', 'mmHg', 90, 140),
    ('Diastolic BP', 'mmHg', 60, 90), ('SpO2', '%', 90, 100),
    ('Temperature', 'F', 97.0, 99.5), ('Respiratory Rate', 'bpm', 12, 20)
]

LABS = [
    ('WBC', 'White Blood Cell Count', 'K/uL', 4.0, 11.0),
    ('HbA1c', 'Hemoglobin A1c', '%', 4.0, 6.5),
    ('Creatinine', 'Creatinine', 'mg/dL', 0.6, 1.2),
    ('Glu', 'Glucose', 'mg/dL', 70, 100),
    ('Chol', 'Total Cholesterol', 'mg/dL', 125, 200)
]

MEDICATIONS = [
    ('Metformin', 'Oral', '500mg', 'BID'), ('Lisinopril', 'Oral', '10mg', 'Daily'),
    ('Atorvastatin', 'Oral', '20mg', 'Daily'), ('Amlodipine', 'Oral', '5mg', 'Daily'),
    ('Levothyroxine', 'Oral', '50mcg', 'Daily'), ('Albuterol', 'Inhaler', '90mcg', 'PRN'),
    ('Furosemide', 'Oral', '20mg', 'Daily'), ('Omeprazole', 'Oral', '20mg', 'Daily')
]

NOTE_TYPES = ['Progress Note', 'Discharge Summary', 'Nursing Note', 'Consult Note']
PREDICTION_MODELS = ['Sepsis_Risk_v1', 'Readmission_Risk_v2', 'Mortality_Risk_v1']

def generate_data():
    print(f"Generating {NUM_RECORDS} records for each table...")
    
    # 1. Patients
    print("Generating Patients...")
    patients = []
    patient_ids = [str(uuid.uuid4()) for _ in range(NUM_RECORDS)]
    
    for pid in patient_ids:
        patients.append({
            'patient_id': pid,
            'mrn': f"MRN-{fake.unique.random_number(digits=8)}",
            'date_of_birth': fake.date_of_birth(minimum_age=18, maximum_age=90),
            'gender': random.choice(['M', 'F']),
            'ethnicity': random.choice(['Hispanic', 'Non-Hispanic White', 'Black/African American', 'Asian', 'Other']),
            'blood_type': random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'created_at': fake.date_time_between(start_date='-5y', end_date='now')
        })
    df_patients = pd.DataFrame(patients)
    df_patients.to_csv(f"{OUTPUT_DIR}/patients.csv", index=False)

    # 2. Encounters
    print("Generating Encounters...")
    encounters = []
    encounter_ids = [str(uuid.uuid4()) for _ in range(NUM_RECORDS)]
    
    for i in range(NUM_RECORDS):
        start_ts = fake.date_time_between(start_date='-1y', end_date='now')
        end_ts = start_ts + timedelta(days=random.randint(1, 14))
        
        encounters.append({
            'encounter_id': encounter_ids[i],
            'patient_id': random.choice(patient_ids), # Random assignment, some patients might have multiple or none, but ensures 1000 encounters
            'encounter_type': random.choice(['Inpatient', 'Emergency', 'Outpatient']),
            'start_timestamp': start_ts,
            'end_timestamp': end_ts if random.random() > 0.1 else None, # 10% still admitted
            'discharge_disposition': random.choice(['Home', 'SNF', 'Home Health', 'Expired']) if random.random() > 0.1 else None,
            'drg_code': f"DRG-{random.randint(100, 999)}"
        })
    df_encounters = pd.DataFrame(encounters)
    df_encounters.to_csv(f"{OUTPUT_DIR}/encounters.csv", index=False)

    # 3. Clinical Notes
    print("Generating Clinical Notes...")
    notes = []
    for _ in range(NUM_RECORDS):
        enc = random.choice(encounters)
        note_ts = enc['start_timestamp'] + timedelta(hours=random.randint(1, 24))
        
        notes.append({
            'note_id': str(uuid.uuid4()),
            'encounter_id': enc['encounter_id'],
            'author_role': random.choice(['Physician', 'Nurse', 'Resident']),
            'note_type': random.choice(NOTE_TYPES),
            'note_text': fake.paragraph(nb_sentences=5),
            'signed_at': note_ts
        })
    df_notes = pd.DataFrame(notes)
    df_notes.to_csv(f"{OUTPUT_DIR}/clinical_notes.csv", index=False)

    # 4. Vitals
    print("Generating Vitals...")
    vitals_data = []
    for _ in range(NUM_RECORDS):
        enc = random.choice(encounters)
        vital_type, unit, min_val, max_val = random.choice(VITALS)
        val = round(random.uniform(min_val, max_val), 1)
        # Add some outliers
        if random.random() < 0.05:
            val *= 1.2 
            
        vitals_data.append({
            'vital_id': str(uuid.uuid4()),
            'encounter_id': enc['encounter_id'],
            'vital_type': vital_type,
            'vital_value': val,
            'unit': unit,
            'measured_at': enc['start_timestamp'] + timedelta(minutes=random.randint(10, 600))
        })
    df_vitals = pd.DataFrame(vitals_data)
    df_vitals.to_csv(f"{OUTPUT_DIR}/vitals.csv", index=False)

    # 5. Lab Results
    print("Generating Lab Results...")
    labs_data = []
    for _ in range(NUM_RECORDS):
        enc = random.choice(encounters)
        lab_code, test_name, unit, min_ref, max_ref = random.choice(LABS)
        val = round(random.uniform(min_ref * 0.8, max_ref * 1.2), 2)
        
        labs_data.append({
            'lab_id': str(uuid.uuid4()),
            'encounter_id': enc['encounter_id'],
            'lab_code': lab_code, # Simplified code
            'test_name': test_name,
            'result_value': val,
            'result_unit': unit,
            'reference_range': f"{min_ref} - {max_ref}",
            'collected_at': enc['start_timestamp'] + timedelta(hours=random.randint(1, 12))
        })
    df_labs = pd.DataFrame(labs_data)
    df_labs.to_csv(f"{OUTPUT_DIR}/lab_results.csv", index=False)

    # 6. Diagnoses
    print("Generating Diagnoses...")
    diag_data = []
    for _ in range(NUM_RECORDS):
        enc = random.choice(encounters)
        icd, desc = random.choice(DIAGNOSES)
        
        diag_data.append({
            'diagnosis_id': str(uuid.uuid4()),
            'encounter_id': enc['encounter_id'],
            'icd_code': icd,
            'description': desc,
            'diagnosis_type': random.choice(['Admitting', 'Primary', 'Secondary']),
            'diagnosed_at': enc['start_timestamp']
        })
    df_diag = pd.DataFrame(diag_data)
    df_diag.to_csv(f"{OUTPUT_DIR}/diagnoses.csv", index=False)

    # 7. Medications
    print("Generating Medications...")
    med_data = []
    for _ in range(NUM_RECORDS):
        enc = random.choice(encounters)
        drug, route, dosage, freq = random.choice(MEDICATIONS)
        
        med_data.append({
            'med_id': str(uuid.uuid4()),
            'encounter_id': enc['encounter_id'],
            'drug_name': drug,
            'rxnorm_code': f"RX-{random.randint(1000, 9999)}",
            'dosage': dosage,
            'route': route,
            'frequency': freq,
            'start_date': enc['start_timestamp'] + timedelta(hours=2),
            'end_date': enc['start_timestamp'] + timedelta(days=5) if enc['end_timestamp'] else None
        })
    df_meds = pd.DataFrame(med_data)
    df_meds.to_csv(f"{OUTPUT_DIR}/medications.csv", index=False)

    # 8. Predictions
    print("Generating Predictions...")
    pred_data = []
    for _ in range(NUM_RECORDS):
        enc = random.choice(encounters)
        model = random.choice(PREDICTION_MODELS)
        risk = random.random()
        
        pred_data.append({
            'prediction_id': str(uuid.uuid4()),
            'encounter_id': enc['encounter_id'],
            'model_name': model,
            'risk_score': round(risk, 4),
            'predicted_class': 'High Risk' if risk > 0.7 else ('Medium Risk' if risk > 0.3 else 'Low Risk'),
            'prediction_timestamp': enc['start_timestamp'] + timedelta(hours=24),
            'actual_outcome': 1 if random.random() < risk else 0 # Simulated ground truth
        })
    df_preds = pd.DataFrame(pred_data)
    df_preds.to_csv(f"{OUTPUT_DIR}/prediction_predictions.csv", index=False)
    
    print("Data generation complete. Files saved to:", OUTPUT_DIR)

if __name__ == "__main__":
    generate_data()
