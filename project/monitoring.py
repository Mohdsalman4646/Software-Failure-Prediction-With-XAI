import psutil
import time

def get_live_data():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory().percent

    # Create additional features
    errors = 1 if cpu > 80 else 0
    response_time = cpu * 0.5

    return cpu, memory, errors, response_time


def main():
    while True:
        cpu, memory, errors, response_time = get_live_data()

        print("CPU:", cpu)
        print("Memory:", memory)
        print("Errors:", errors)
        print("Response Time:", response_time)
        print("----------------------------")

        time.sleep(2)


if __name__ == "__main__":
    main()