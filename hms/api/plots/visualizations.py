import matplotlib.pyplot as plt
import numpy as np
import io
from datetime import datetime, date, time
from django.http import HttpResponse
from numpy.polynomial.polynomial import Polynomial

class ChildGrowthPlot:
    """Class to generate child's growth chart as an image."""

    def __init__(self, child):
        self.child = child

    def generate_plot(self):
        """Generate the growth chart and return it as an HTTP response."""
        growth_history = self.child.get_growth_history()

        if not growth_history:
            return HttpResponse("No growth records available for this child.", status=404)

        # Extract data
        from datetime import datetime, date

        dates = [datetime.combine(record["date_recorded"], datetime.min.time()) if isinstance(record["date_recorded"], date) else record["date_recorded"] for record in growth_history]


        weights = [record["weight"] for record in growth_history]
        heights = [record["height"] for record in growth_history]
        bmis = [record["bmi"] for record in growth_history]

        # Create subplots
        fig, ax = plt.subplots(3, 1, figsize=(10, 12))

        ax[0].plot(dates, weights, marker='o', linestyle='-', color='blue', label='Weight (kg)')
        ax[0].set_title("Weight Progression Over Time")
        ax[0].set_xlabel("Date")
        ax[0].set_ylabel("Weight (kg)")
        ax[0].grid(True)
        ax[0].legend()

        ax[1].plot(dates, heights, marker='s', linestyle='-', color='green', label='Height (cm)')
        ax[1].set_title("Height Progression Over Time")
        ax[1].set_xlabel("Date")
        ax[1].set_ylabel("Height (cm)")
        ax[1].grid(True)
        ax[1].legend()

        ax[2].plot(dates, bmis, marker='^', linestyle='-', color='red', label='BMI')
        ax[2].set_title("BMI Progression Over Time")
        ax[2].set_xlabel("Date")
        ax[2].set_ylabel("BMI")
        ax[2].grid(True)
        ax[2].legend()

        # Save plot to memory buffer
        buf = io.BytesIO()
        plt.tight_layout()
        plt.savefig(buf, format="png")
        plt.close(fig)
        buf.seek(0)

        # Return image as HTTP response
        return HttpResponse(buf.getvalue(), content_type="image/png")


def get_dates_and_values(growth_history, value_key):
    from datetime import datetime, date, time
    import numpy as np
    
    converted_dates = []
    for record in growth_history:
        raw_date = record["date_recorded"]
        if isinstance(raw_date, datetime):
            converted_dates.append(raw_date)
        elif isinstance(raw_date, date):
            # Convert date to datetime
            converted_dates.append(datetime.combine(raw_date, time.min))
        elif isinstance(raw_date, str):
            converted_dates.append(datetime.strptime(raw_date, "%Y-%m-%d"))
        else:
            raise TypeError(f"Unexpected date format: {raw_date}")

    # Convert to float if record[value_key] is Decimal
    values = [float(record[value_key]) for record in growth_history]
    timestamps = np.array([d.timestamp() for d in converted_dates], dtype=float)

    return converted_dates, values, timestamps

def generate_growth_percentile_chart(child):
    """Generate Growth Percentile Chart for Weight, Height, and BMI."""
    growth_history = child.get_growth_history()
    if not growth_history:
        return HttpResponse("No growth records available for this child.", status=404)

    # Extract weight, height, BMI data
    dates, weights, _ = get_dates_and_values(growth_history, "weight")
    _, heights, _ = get_dates_and_values(growth_history, "height")
    _, bmis, _ = get_dates_and_values(growth_history, "bmi")

    # Calculate percentiles for each metric
    w25, w50, w75 = np.percentile(weights, 25), np.percentile(weights, 50), np.percentile(weights, 75)
    h25, h50, h75 = np.percentile(heights, 25), np.percentile(heights, 50), np.percentile(heights, 75)
    b25, b50, b75 = np.percentile(bmis, 25), np.percentile(bmis, 50), np.percentile(bmis, 75)

    fig, axes = plt.subplots(nrows=3, ncols=1, figsize=(10, 15))

    # === Weight Subplot ===
    axes[0].plot(dates, weights, marker='o', linestyle='-', color='blue', label='Weight (kg)')
    axes[0].axhline(w25, color='green', linestyle='--', label='25th Pctl')
    axes[0].axhline(w50, color='orange', linestyle='--', label='50th Pctl')
    axes[0].axhline(w75, color='red', linestyle='--', label='75th Pctl')
    axes[0].set_title("Weight Percentiles")
    axes[0].set_xlabel("Date")
    axes[0].set_ylabel("Weight (kg)")
    axes[0].grid(True)
    axes[0].legend()

    # === Height Subplot ===
    axes[1].plot(dates, heights, marker='s', linestyle='-', color='purple', label='Height (cm)')
    axes[1].axhline(h25, color='green', linestyle='--', label='25th Pctl')
    axes[1].axhline(h50, color='orange', linestyle='--', label='50th Pctl')
    axes[1].axhline(h75, color='red', linestyle='--', label='75th Pctl')
    axes[1].set_title("Height Percentiles")
    axes[1].set_xlabel("Date")
    axes[1].set_ylabel("Height (cm)")
    axes[1].grid(True)
    axes[1].legend()

    # === BMI Subplot ===
    axes[2].plot(dates, bmis, marker='^', linestyle='-', color='teal', label='BMI')
    axes[2].axhline(b25, color='green', linestyle='--', label='25th Pctl')
    axes[2].axhline(b50, color='orange', linestyle='--', label='50th Pctl')
    axes[2].axhline(b75, color='red', linestyle='--', label='75th Pctl')
    axes[2].set_title("BMI Percentiles")
    axes[2].set_xlabel("Date")
    axes[2].set_ylabel("BMI")
    axes[2].grid(True)
    axes[2].legend()

    return save_plot(fig)

def generate_growth_velocity_chart(child):
    """Generate Growth Velocity (Rate of Change) for Weight, Height, and BMI."""
    growth_history = child.get_growth_history()
    if not growth_history or len(growth_history) < 2:
        return HttpResponse("Insufficient growth records for velocity calculation.", status=404)

    # Extract data
    dates, weights, timestamps = get_dates_and_values(growth_history, "weight")
    _, heights, _ = get_dates_and_values(growth_history, "height")
    _, bmis, _ = get_dates_and_values(growth_history, "bmi")

    # Convert to time in years for velocity calculation
    # velocity = Δvalue / Δtime_in_years
    time_in_years = timestamps / (60 * 60 * 24 * 365)

    # Weight velocity
    w_velocity = np.diff(weights) / np.diff(time_in_years)
    w_dates = dates[1:]

    # Height velocity
    h_velocity = np.diff(heights) / np.diff(time_in_years)
    h_dates = dates[1:]

    # BMI velocity
    b_velocity = np.diff(bmis) / np.diff(time_in_years)
    b_dates = dates[1:]

    fig, axes = plt.subplots(nrows=3, ncols=1, figsize=(10, 15))

    # === Weight Velocity Subplot ===
    axes[0].plot(w_dates, w_velocity, marker='o', linestyle='-', color='blue', label='Weight Velocity (kg/year)')
    axes[0].set_title("Weight Velocity")
    axes[0].set_xlabel("Date")
    axes[0].set_ylabel("kg/year")
    axes[0].grid(True)
    axes[0].legend()

    # === Height Velocity Subplot ===
    axes[1].plot(h_dates, h_velocity, marker='s', linestyle='-', color='purple', label='Height Velocity (cm/year)')
    axes[1].set_title("Height Velocity")
    axes[1].set_xlabel("Date")
    axes[1].set_ylabel("cm/year")
    axes[1].grid(True)
    axes[1].legend()

    # === BMI Velocity Subplot ===
    axes[2].plot(b_dates, b_velocity, marker='^', linestyle='-', color='red', label='BMI Velocity (BMI units/year)')
    axes[2].set_title("BMI Velocity")
    axes[2].set_xlabel("Date")
    axes[2].set_ylabel("BMI/year")
    axes[2].grid(True)
    axes[2].legend()

    return save_plot(fig)


def generate_growth_forecast_chart(child):
    """Generate Predictive Growth Forecast for Weight, Height, and BMI."""
    growth_history = child.get_growth_history()
    if not growth_history or len(growth_history) < 3:
        return HttpResponse("Insufficient growth records for trend prediction.", status=404)

    # Extract data
    dates, weights, timestamps = get_dates_and_values(growth_history, "weight")
    _, heights, timestamps2 = get_dates_and_values(growth_history, "height")
    _, bmis, timestamps3 = get_dates_and_values(growth_history, "bmi")

    fig, axes = plt.subplots(nrows=3, ncols=1, figsize=(10, 15))

    # === Weight Trendline ===
    if len(weights) >= 3:
        w_poly = Polynomial.fit(timestamps, weights, 2)
        w_trend = w_poly(timestamps)
        axes[0].plot(dates, weights, marker='o', linestyle='-', color='blue', label='Weight (kg)')
        axes[0].plot(dates, w_trend, linestyle='--', color='black', label='Predicted Trend')
        axes[0].set_title("Weight Forecast")
        axes[0].legend()

    # === Height Trendline ===
    if len(heights) >= 3:
        h_poly = Polynomial.fit(timestamps2, heights, 2)
        h_trend = h_poly(timestamps2)
        axes[1].plot(dates, heights, marker='s', linestyle='-', color='purple', label='Height (cm)')
        axes[1].plot(dates, h_trend, linestyle='--', color='black', label='Predicted Trend')
        axes[1].set_title("Height Forecast")
        axes[1].legend()

    # === BMI Trendline ===
    if len(bmis) >= 3:
        b_poly = Polynomial.fit(timestamps3, bmis, 2)
        b_trend = b_poly(timestamps3)
        axes[2].plot(dates, bmis, marker='^', linestyle='-', color='red', label='BMI')
        axes[2].plot(dates, b_trend, linestyle='--', color='black', label='Predicted Trend')
        axes[2].set_title("BMI Forecast")
        axes[2].legend()

    for ax in axes:
        ax.set_xlabel("Date")
        ax.grid(True)

    return save_plot(fig)


def save_plot(fig):
    """Save plot to memory buffer and return as HTTP response."""
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    return HttpResponse(buf.getvalue(), content_type="image/png")
