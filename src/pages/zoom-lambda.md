---
title: "Zoom in time of COVID19 and s3 storage"
date: "2020-05-02"
tag: ["zoom","s3","aws","webhook"]
---

# The question

Hello there! I hope you guys are doing ok. Due to COVID19 I've been spending a lot of my time and effort trying to optimize clients' aws bill and surpriselly enough I've found one or two of them willing to try something different such as serverless. Although cost is the main driver for this they realise pretty soon the advantages that comes with fargate using CI/CD techniques and its magic. But that's not what I want to talk about.

The exiting last week question was **"Is there a way to save all my Zoom conferences to S3 automagically?"**.

Well... it turn's out it's possible but there's plug and play plugin you can enable on Zoom's store and boom. It goes more in the lines of understanding what zoom can do natively and design some logic around it, hopefully using lambda.

That's what I dit.

# A little research first ...

A little googling yelled me this : [site](https://devforum.zoom.us/t/how-can-i-record-a-zoom-meeting-with-amazon-s3/12356) and this vague comment that says : "simply use the recording completed webhook, and then upload the download_url to your S3 bucket." and that's exactly what I implemented. I didn't even know Zoom had webhooks to offer to be honest. 

# Start with cloud9

So the first thing I did was creating a new environment on Cloud9 because of it's integration with Lambda and ease to use.

The function idea is very simple, it has to :
- Receive the event (json body), documented below
- Get the recording meta-data and download url
- Download the mp4 file to /tmp.
- Upload the file to S3.

The event itself would look according to their documentation [Zoom Documentation](https://marketplace.zoom.us/docs/api-reference/webhook-reference/recording-events/recording-completed)
, but I failed to notice the object itself brings the download token. So I learned the hard way it was actually working but downloading useless garbage to my S3 until I put the download token.

So the basic architecture would be something like this :
![Architecture](/imgs/zoomArch.png)
So I will get an event with the webhook, this event is a simple invokation to an API Gateway which triggers a lambda who's gonnna download the recording and upload it to S3, as mentioned before.
So it started by writing the lambda with the sample payload :
<details open>
    <summary>Sample event json (Click to expand)</summary>

```json
    {
    "event": "recording.completed",
    "payload": {
        "account_id": "lAAAAAAAAAAAAA",
        "object": {
            "uuid": "dj12vck6sdTn6yy7qdy3dQg==",
            "id": 150000008,
            "host_id": "uLobbbbbbbbbb_qQsQ",
            "topic": "A test meeting",
            "type": 2,
            "start_time": "2019-07-11T20:00:00Z",
            "duration": 1,
            "timezone": "America/Los_Angeles",
            "host_email": "somemeail@someemailservice.fjdjf",
            "total_size": 529758,
            "recording_count": 4,
            "share_url": "https://zoom.us/recording/share/aaaaaannnnnldglrkgmrmhh",
            "recording_files": [
                {
                    "id": "8f88599d-19ca-4d2b-a965-1196e777cb3c",
                    "meeting_id": "bpKUheqtRLifLBcIYVJLZw==",
                    "recording_start": "2019-07-23T22:14:57Z",
                    "recording_end": "2019-07-23T22:15:41Z",
                    "file_type": "MP4",
                    "file_size": 282825,
                    "play_url": "https://zoom.us/recording/play/80ebRwsfjskf2H3vlSigX0gNlBBBBBBBBBBBBBB",
                    "download_url": "https://zoom.us/recording/download/80ebRwsfjskf2H3vlSigX0gNlBBBBBBBBBBBBBB",
                    "status": "completed",
                    "recording_type": "shared_screen_with_speaker_view"
                },
                {
                    "id": "a6b332f9-2246-49e5-913e-588adc7f0f5f",
                    "meeting_id": "bpKUheqtRLifLBcIYVJLZw==",
                    "recording_start": "2019-07-23T22:14:57Z",
                    "recording_end": "2019-07-23T22:15:41Z",
                    "file_type": "M4A",
                    "file_size": 246560,
                    "play_url": "https://zoom.us/recording/play/Oaevut8LSACCCCCCCCnnnnnnnnbbbb",
                    "download_url": "https://zoom.us/recording/download/Oaevut8LSACCCCCCCCnnnnnnnnbbbb",
                    "status": "completed",
                    "recording_type": "audio_only"
                },
                {
                    "meeting_id": "bpKUheqtRLifLBcIYVJLZw==",
                    "recording_start": "2019-07-23T22:14:57Z",
                    "recording_end": "2019-07-23T22:15:41Z",
                    "file_type": "TIMELINE",
                    "download_url": "https://zoom.us/recording/download/2dBBBBBccccDDDDeeee"
                },
                {
                    "id": "97a4f7ca-e7e8-4e3b-b28a-27b42cd33c09",
                    "meeting_id": "bpKUheqtRLifLBcIYVJLZw==",
                    "recording_start": "2019-07-23T22:14:57Z",
                    "recording_end": "2019-07-23T22:15:41Z",
                    "file_type": "TRANSCRIPT",
                    "file_size": 373,
                    "play_url": "https://zoom.us/recording/play/7h0BBBBBBBchfhfhffh_0AAAAbbbbbeeSFcf209m",
                    "download_url": "https://zoom.us/recording/play/7h0BBBBBBBchfhfhffh_0AAAAbbbbbeeSFcf209m",
                    "status": "completed",
                    "recording_type": "audio_transcript"
                }
            ]
        }
    }
    }
```

</details>

# Lambda function

So the code to process that sample event is will be a simple json handling in python.
<details open>
    <summary>Parsing the event and getting meta data to generate the S3 file name.(Click to expand)</summary>

```python
...
import json
...
def lambda_handler(event, context):
    #print(event)
    evento = json.loads(event["body"])
    
    #Zoom meta data from the webhook
    #This download token is not documented in the sample but in the tutorial it is, so we have to capture it.
    download_token = evento["download_token"]
    account_id = evento["payload"]["account_id"]
    host_id = evento["payload"]["object"]["host_id"]
    topic = evento["payload"]["object"]["topic"].replace(" ","")
    #base is going to be used to name the folders in S3
    base = "{}/{}/{}/".format(account_id,host_id,topic)
```

</details>

After that, I just had to do the request with the download token as described in the original documentation and save it temporarily (to /tmp) like this :

So the code to process that sample event is :
<details open>
    <summary>Parsing the event and getting meta data to generate the S3 file name.(Click to expand)</summary>

```python
...
import json
import requests
import uuid
...
def lambda_handler(event, context):
...
        # Zoom sends you the link to more than one file, so I had to parse the links with a basic for loop.
        for media in evento["payload"]["object"]["recording_files"] :
        print(media["file_type"])
        meeting_id = media["meeting_id"]
        
        #Wanted to generate some randomness for the file name, so using uuid for that. 
        tmp = str(uuid.uuid4())
        
        #generate some unique names based on the meta data.
        name = base + meeting_id + "." + media["file_type"]
        
        #Gonna print the data so it gets stored in cloudwatch and can be debugged later.
        print("Token : "+ download_token)
        print("Url:" + media["download_url"] )

        #This is the actual request to download this. Notice the access token part so zoom gives us the access.
        response = requests.get(media["download_url"] + "?access_token=" + download_token )
        with open("/tmp/"+tmp, 'wb') as fd:
            for chunk in response.iter_content(chunk_size=128):
                fd.write(chunk)
        print("wrote file {}".format(name))
        fd.close()
        #Simple upload file function for S3's Documentation sample directly.
        if upload_file("/tmp/"+tmp, s3bucket,name) :
            print("Uploaded file {} to {}".format(name,s3bucket))
        else :
            print("error uploading file to s")

...
```


</details>


And voilá ! That works like a charm, some parts of the code were ommited for brevity you can find the complete lambda on [github](https://github.com/felipedbene/lambda-zoom)

# API Gateway

Once that is done, all I had to do was to configure the http api gateway to trigger that lambda.
I'm using a HTTP API flavour of API Gateway due to the fact it's lighter and easier to integrate and perfect for scenarios like this one. Below is the screen shot of general configuration.
![apigw1](/imgs/apigw1.png) 
I've configured a any method to be send to the lambda as you can see.
![apigw2](/imgs/apigw2.png) 

So this concludes the Amazon Part of it now the only part missing is creating an application on Zoom so they can send us the webhooks and process the whole thing.

# Zoom marketplace

So I created an account on zoom's marketplace [site](https://marketplace.zoom.us/develop/create) and chose "Webhook only" application as you can see in the picture.
![zoom1](/imgs/zoom1.png)

Filled a couple of fields such as company, emails and etc. Nothing interesting there.
![zoom2](/imgs/zoom2.png)
![zoom3](/imgs/zoom3.png)
Here comes the good part where you can actually "Add the features" you would like your application to have.
![zoom4](/imgs/zoom4.png)
In this case I just added the events subscription and put an API Gateway endpoint as the notification url. That will be created when you create the API Gateway, as mentioned before.
![zoom5](/imgs/zoom5.png)
Lastly, we gonna choose the appropriate event type so Zoom alerts us when you happens. In this particular case when a meeting recording is complete.
That is, when zoom has finished processing the recorded meeting in their cloud and sends us the event so we can download it.

# Testing

The only detail here is that the meeting has be recorded in the cloud.
![screenshot1](/imgs/scshoot1.png)
I've started a testing meeting and set it to make a cloud recording, once the meeting has ended and has finished being processed by zoom, they will send an email and a webhook.
![webhook1](/imgs/webhook1.png).
And all is left to do is checking the file is actually in S3 as follows:
![sc2](/imgs/sc2.png)
And it is !!! So all is good and mission is accomplished.