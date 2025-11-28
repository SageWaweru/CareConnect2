import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message, CustomUser
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.customer_id = self.scope["url_route"]["kwargs"]["customer_id"]
        self.caregiver_id = self.scope["url_route"]["kwargs"]["caregiver_id"]
        self.room_group_name = f"chat_{self.customer_id}_{self.caregiver_id}"

        # Join the room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    @sync_to_async
    def mark_message_as_read(self, message_id):
        # Update the message's 'read' status
        message = Message.objects.get(id=message_id)
        message.read = True
        message.save()

    async def receive(self, text_data):
        # Receive message from WebSocket
        data = json.loads(text_data)
        sender_id = data['sender']
        receiver_id = data['receiver']
        message_content = data['message']

        # Fetch sender and receiver from database
        sender = await sync_to_async(CustomUser.objects.get)(id=sender_id)
        receiver = await sync_to_async(CustomUser.objects.get)(id=receiver_id)

        # Save message to database
        saved_message = await self.save_message (sender.id, receiver.id, message_content)

        # Mark message as read when caregiver is the receiver
        if receiver_id == self.caregiver_id:
            await self.mark_message_as_read(saved_message["id"])

        # Send the message to the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": saved_message["message"],
                "sender": saved_message["sender"],
                "receiver": saved_message["receiver"],
                "timestamp": saved_message["timestamp"],
            }
        )

    async def chat_message(self, event):
    # Only send the message if the current user is NOT the sender
        if str(self.customer_id) != str(event["sender"]):  
            await self.send(text_data=json.dumps(event))

    @ sync_to_async
    def save_message(self, sender_id, receiver_id, message):
        msg = Message.objects.create(sender_id=sender_id, receiver_id=receiver_id, content=message)
        print(f"✅ Message Saved: {msg.content} | Sender: {msg.sender_id} | Receiver: {msg.receiver_id}")
        return {
            "id": msg.id,
            "message": msg.content,
            "sender": msg.sender_id,
            "receiver": msg.receiver_id,
            "timestamp": str(msg.timestamp),
        }
