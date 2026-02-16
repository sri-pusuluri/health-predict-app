
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load the trained model pipeline
MODEL_PATH = "../medical_predictive_data/models/full_risk_pipeline.pkl"
FEATURE_NAMES_PATH = "../medical_predictive_data/models/feature_names.pkl"
LEADS_DATA_PATH = "../leads.csv"

model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURE_NAMES_PATH)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        # Convert input to DataFrame
        input_df = pd.DataFrame([data])
        
        # Ensure only relevant columns are passed (the pipeline expects specific features)
        # Fill missing with 0 for this demo
        for col in feature_names:
            if col not in input_df.columns:
                input_df[col] = 0
        
        input_df = input_df[feature_names]
        
        # Predict probability
        prob = model.predict_proba(input_df)[0][1]
        
        category = 'Low Risk'
        if prob >= 0.75: category = 'High Risk'
        elif prob >= 0.45: category = 'Elevated Risk'
        
        return jsonify({
            'probability': float(prob),
            'category': category,
            'details': 'Prediction based on clinical parameters and history.'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/leads', methods=['GET'])
def get_leads():
    try:
        if os.path.exists(LEADS_DATA_PATH):
            df = pd.read_csv(LEADS_DATA_PATH)
            # Just send top 20 for the UI
            df = df.sort_values('Predicted_Probability', ascending=False).head(20)
            return jsonify(df.to_dict(orient='records'))
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)
