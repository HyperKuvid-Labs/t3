import uuid


def generate_room_id():
    return str(uuid.uuid4())  # Take the first 8 characters for brevity


room_id = generate_room_id()
print(f"Your room ID is: {room_id}")
