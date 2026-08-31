import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from scripts.generate_data import generate_synthetic_dataset

if __name__ == "__main__":
    print("Seeding FraudGraph AI Database...")
    generate_synthetic_dataset()
    print("Database seeding completed successfully.")
