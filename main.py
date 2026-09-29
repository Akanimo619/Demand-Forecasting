# Library imports

import uvicorn
from fastapi import FastAPI
from DemandNotes import DemandNote
import numpy as np
import joblib
import pandas as pd

app = FastAPI()
# Load the joblib regression model directly in a single line
regressor = joblib.load("rf_random_search_model.joblib")

# 2. Simplest hardcoded list of the columns your notebook used right before model.fit()
# Make sure this order matches your training notebook exactly.
MODEL_COLUMNS = [
    'Units_Sold', 'Units_Ordered', 'Discount',
    'Category_Clothing', 'Category_Electronics', 'Category_Home',
    'Region_East', 'Region_North', 'Region_South', 'Region_West',
    'Inventory_Level_High', 'Inventory_Level_Low', 'Inventory_Level_Medium',
    'Weather_Condition_Cloudy', 'Weather_Condition_Rainy', 'Weather_Condition_Snowy', 'Weather_Condition_Sunny',
    'Seasonality_Autumn', 'Seasonality_Spring', 'Seasonality_Summer', 'Seasonality_Winter'
]

@app.get('/')
def index():
    return {'message':"Hello, stranger"}

@app.get('/name')
def get_name(name: str):
    return {'Welcome to Krish Youtube Channel': f'{name}'}


# Expose the prediction functionality and make a prediction from the passed JSON data

@app.post('/predict')
def predict(data: DemandNote):
    # 3. Load input directly into a clean DataFrame row
    df = pd.DataFrame([data.model_dump()])
    
    # 4. One-hot encode the categorical text fields instantly
    categorical_cols = ['Category', 'Region', 'Inventory_Level', 'Weather_Condition', 'Seasonality']
    df_encoded = pd.get_dummies(df, columns=categorical_cols)
    
    # 5. Restructure the DataFrame columns to match the model training layout
    df_aligned = df_encoded.reindex(columns=MODEL_COLUMNS, fill_value=0)
    
    # 6. FIX: Pass the DataFrame DIRECTLY into the model. Do NOT use .values or np.array!
    numeric_predictions = regressor.predict(df_aligned)

    # Return the result (converting numpy float to standard python float)
    return {
        "predicted_value": float(numeric_predictions[0])
    }


# Run the API with uvicorn
# Will run on http://127.0.0.1:8000

if __name__ == '_main_':
    uvicorn.run(app, host='127.0.0.1',port=8000)

# uvicorn main:app --reload

