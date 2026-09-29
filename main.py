# Library imports
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import numpy as np
import joblib
import pandas as pd
import os

# Define the Pydantic schema right here to prevent import errors on Render
class DemandNote(BaseModel):
    Units_Sold: float
    Units_Ordered: float
    Discount: float
    Category: str
    Region: str
    Inventory_Level: str
    Weather_Condition: str
    Seasonality: str

app = FastAPI()

# 1. Enable CORS so your React Dev Server (port 5173) can talk to FastAPI (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows smooth cross-origin communication
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the joblib regression model directly
regressor = joblib.load("rf_random_search_model.joblib")

MODEL_COLUMNS = [
    'Units_Sold', 'Units_Ordered', 'Discount',
    'Category_Clothing', 'Category_Electronics', 'Category_Home',
    'Region_East', 'Region_North', 'Region_South', 'Region_West',
    'Inventory_Level_High', 'Inventory_Level_Low', 'Inventory_Level_Medium',
    'Weather_Condition_Cloudy', 'Weather_Condition_Rainy', 'Weather_Condition_Snowy', 'Weather_Condition_Sunny',
    'Seasonality_Autumn', 'Seasonality_Spring', 'Seasonality_Summer', 'Seasonality_Winter'
]

@app.get('/api')
def index():
    return {'message': "Hello from the Demand Forecasting API"}

@app.post('/api/predict')
def predict(data: DemandNote):
    df = pd.DataFrame([data.model_dump()])
    
    categorical_cols = ['Category', 'Region', 'Inventory_Level', 'Weather_Condition', 'Seasonality']
    df_encoded = pd.get_dummies(df, columns=categorical_cols)
    df_aligned = df_encoded.reindex(columns=MODEL_COLUMNS, fill_value=0)
    
    numeric_predictions = regressor.predict(df_aligned)

    return {
        "predicted_value": float(numeric_predictions[0])
    }

# 2. Production Static Routing: Serve built React static files automatically on Render
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")

    @app.get("/{catchall:path}")
    def read_index(catchall: str):
        return FileResponse("frontend/dist/index.html")

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
