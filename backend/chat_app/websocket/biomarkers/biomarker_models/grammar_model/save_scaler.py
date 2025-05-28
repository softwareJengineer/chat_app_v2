from pickle import dump
import os
from sklearn.preprocessing import StandardScaler
import pandas as pd
root_path = "C:/Users/byh71/OneDrive/바탕 화면/OneDrive - University of Toronto/배영호/1. HRI Social Cognition Project/15. Dementia SDS/9. Interface/1. Source code/interface_with_biomarkers(testing)/Working_code/grammar_model/datasets"

# Creating the scalar object using the trained dataset.

control_file = root_path + '/control_extracted_feature.xlsx'
dementia_file = root_path + '/dementia_extracted_feature.xlsx'
control_df = pd.read_excel(control_file)
dementia_df = pd.read_excel(dementia_file)
data = pd.concat([control_df, dementia_df], ignore_index=True)
X = data.drop(columns=['File Name'])

# Normalize the features using the provided scaler
X.fillna(X.mean(), inplace=True)

# Standardize the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

dump(scaler, open(root_path+'/scaler.pkl', 'wb'))