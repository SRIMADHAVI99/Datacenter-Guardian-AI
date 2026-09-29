"""
Anomaly Engine & Predictive Risk Scoring Service
Provides multi-metric anomaly detection and ML-ready heuristic scoring
for thermal stress, power load, compute saturation, and failure probability.
"""

from typing import Dict, Any, List

class AnomalyDetector:
    """
    Modular detector designed to be drop-in compatible with scikit-learn / ONNX
    models in future iterations.
    """

    def __init__(self):
        # Threshold definitions
        self.TEMP_CRITICAL = 80.0
        self.TEMP_WARNING = 70.0
        self.CPU_HIGH = 90.0
        self.RAM_HIGH = 90.0
        self.GPU_HIGH = 88.0
        self.COOLING_LOW = 65.0
        self.POWER_SPIKE_WATTS = 650.0

    def calculate_risk_score(self, cpu: float, ram: float, gpu: float, temp: float, power: float, cooling: float) -> Dict[str, Any]:
        """
        Calculates holistic risk score (0-100) and sub-component risk vectors.
        """
        # 1. Thermal Risk (Weight: 35%)
        if temp >= self.TEMP_CRITICAL:
            temp_risk = min(100.0, 75.0 + (temp - self.TEMP_CRITICAL) * 4.0)
        elif temp >= self.TEMP_WARNING:
            temp_risk = 40.0 + ((temp - self.TEMP_WARNING) / 10.0) * 35.0
        else:
            temp_risk = max(0.0, (temp / self.TEMP_WARNING) * 35.0)

        # 2. Resource Pressure Risk (Weight: 25%)
        # Combine CPU, RAM, GPU
        resource_pressure = (cpu * 0.45) + (ram * 0.35) + (gpu * 0.20)
        
        # 3. Energy & Power Risk (Weight: 20%)
        if power >= self.POWER_SPIKE_WATTS:
            energy_risk = min(100.0, 70.0 + ((power - self.POWER_SPIKE_WATTS) / 100.0) * 30.0)
        else:
            energy_risk = max(10.0, (power / self.POWER_SPIKE_WATTS) * 65.0)

        # 4. Cooling Deficit Risk (Weight: 20%)
        # Lower cooling efficiency means higher risk
        if cooling < self.COOLING_LOW:
            cooling_risk = min(100.0, 70.0 + (self.COOLING_LOW - cooling) * 2.0)
        else:
            cooling_risk = max(5.0, (100.0 - cooling) * 1.5)

        # Composite failure risk (0 - 100)
        overall_risk = (
            (temp_risk * 0.35) +
            (resource_pressure * 0.25) +
            (energy_risk * 0.20) +
            (cooling_risk * 0.20)
        )
        overall_risk = round(min(99.0, max(1.0, overall_risk)), 1)

        # Determine status classification
        if overall_risk >= 75.0 or temp >= self.TEMP_CRITICAL:
            status = "CRITICAL"
        elif overall_risk >= 45.0 or temp >= self.TEMP_WARNING or cpu >= self.CPU_HIGH:
            status = "WARNING"
        else:
            status = "HEALTHY"

        # Detect specific anomalies
        anomalies = []
        if temp >= self.TEMP_CRITICAL:
            anomalies.append(f"Critical temperature exceeded: {temp:.1f}°C > {self.TEMP_CRITICAL}°C")
        elif temp >= self.TEMP_WARNING:
            anomalies.append(f"Elevated temperature warning: {temp:.1f}°C")

        if cpu >= self.CPU_HIGH:
            anomalies.append(f"CPU compute saturation: {cpu:.1f}%")

        if ram >= self.RAM_HIGH:
            anomalies.append(f"Memory exhaustion threshold: {ram:.1f}%")

        if gpu >= self.GPU_HIGH:
            anomalies.append(f"GPU tensor pipeline maxed: {gpu:.1f}%")

        if cooling < self.COOLING_LOW:
            anomalies.append(f"Cooling efficiency degraded: {cooling:.1f}%")

        if power >= self.POWER_SPIKE_WATTS:
            anomalies.append(f"Power distribution unit surge: {power:.1f}W")

        return {
            "status": status,
            "risk_score": overall_risk,
            "failure_risk": round(overall_risk, 1),
            "temperature_risk": round(temp_risk, 1),
            "resource_pressure": round(resource_pressure, 1),
            "energy_risk": round(energy_risk, 1),
            "cooling_risk": round(cooling_risk, 1),
            "anomalies": anomalies
        }

    def predict_what_if(self, 
                        base_cpu: float = 50.0,
                        base_gpu: float = 40.0,
                        base_temp: float = 65.0,
                        base_cooling: float = 85.0,
                        base_power: float = 450.0,
                        cpu_delta: float = 0.0,
                        gpu_delta: float = 0.0,
                        temp_delta: float = 0.0,
                        cooling_delta: float = 0.0,
                        server_count_delta: int = 0,
                        network_delta: float = 0.0) -> Dict[str, Any]:
        """
        Physics & Thermodynamic correlation simulator for What-if scenarios.
        - High CPU/GPU -> higher power -> higher temperature -> greater cooling requirement
        - Reduced cooling -> higher temperature -> increased failure risk
        """
        # Calculate new operating parameters
        effective_cpu = max(5.0, min(100.0, base_cpu + cpu_delta))
        effective_gpu = max(0.0, min(100.0, base_gpu + gpu_delta))
        effective_cooling = max(20.0, min(100.0, base_cooling + cooling_delta))

        # Power scaling: base + wattage for compute delta + server count impact
        power_multiplier = 1.0 + (cpu_delta * 0.0035) + (gpu_delta * 0.0060) + (server_count_delta * 0.04)
        predicted_power = round(max(200.0, base_power * power_multiplier), 1)
        power_pct_change = round(((predicted_power - base_power) / base_power) * 100.0, 1)

        # Thermal scaling: proportional to power and inversely proportional to cooling efficiency
        thermal_heat_load = (power_pct_change * 0.28) + (temp_delta) - (cooling_delta * 0.22)
        predicted_temp = round(max(35.0, min(95.0, base_temp + thermal_heat_load)), 1)
        temp_abs_delta = round(predicted_temp - base_temp, 1)

        # Cooling requirement scaling
        cooling_requirement_delta = round((power_pct_change * 0.6) + (temp_abs_delta * 1.2), 1)

        # Failure Risk Evaluation
        eval_result = self.calculate_risk_score(
            cpu=effective_cpu,
            ram=65.0,
            gpu=effective_gpu,
            temp=predicted_temp,
            power=predicted_power,
            cooling=effective_cooling
        )
        base_eval = self.calculate_risk_score(
            cpu=base_cpu, ram=65.0, gpu=base_gpu, temp=base_temp, power=base_power, cooling=base_cooling
        )
        risk_delta = round(eval_result["risk_score"] - base_eval["risk_score"], 1)

        # Generate intelligent AI recommendation based on simulation results
        if eval_result["risk_score"] >= 80.0:
            rec = "CRITICAL: Throttle incoming GPU training queues immediately, redistribute compute load to secondary cluster nodes, and ramp liquid cooling pumps to 100% capacity."
        elif eval_result["risk_score"] >= 55.0:
            rec = "WARNING: Move non-critical background batch workloads to Cluster B and increase chilled-water cooling capacity by +15% to maintain safe thermal headroom."
        elif risk_delta > 10.0:
            rec = "ADVISORY: Monitor rack temperature delta closely. Pre-chill coolant loops ahead of planned workload expansion."
        else:
            rec = "OPTIMAL: Simulated workload parameters remain within nominal ASHRAE enterprise operating limits."

        return {
            "inputs": {
                "cpu_delta": cpu_delta,
                "gpu_delta": gpu_delta,
                "temp_delta": temp_delta,
                "cooling_delta": cooling_delta,
                "server_count_delta": server_count_delta,
                "network_delta": network_delta
            },
            "predicted_state": {
                "cpu": effective_cpu,
                "gpu": effective_gpu,
                "power_watts": predicted_power,
                "power_delta_pct": power_pct_change,
                "temperature": predicted_temp,
                "temperature_delta_c": temp_abs_delta,
                "cooling_requirement_delta_pct": cooling_requirement_delta,
                "failure_risk": eval_result["risk_score"],
                "failure_risk_delta_pct": risk_delta,
                "status": eval_result["status"]
            },
            "ai_recommendation": rec
        }

anomaly_detector = AnomalyDetector()
