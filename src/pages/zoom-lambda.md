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
> Receive the event
> Get the recording meta-data and download url
> Download the mp4 file to /tmp.
> Upload the file to S3.

The event itself would look according to their documentation [Zoom Documentation](https://marketplace.zoom.us/docs/api-reference/webhook-reference/recording-events/recording-completed)

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




# Zoom marketplace

So I created an account on zoom's marketplace [site](https://marketplace.zoom.us/develop/create) and chose "Webhook only" application as you can see in the picture.
![zoom1](/imgs/zoom1.png)

Filled a couple of fields such as company, emails and etc. Nothing interesting there.

![zoom2](/imgs/zoom2.png)
![zoom3](/imgs/zoom3.png)
Here comes the good part where you can actually "Add the features" you would like your application to have.
![zoom4](/imgs/zoom4.png)
In this case I just added the events subscription and put an API Gateway endpoint as the notification url. Don't worry about the actual endpoint as of now because we haven't created it yet. That will be created when you create the API Gateway, covered later.
![zoom5](/imgs/zoom5.png)
Lastly, we gonna choose the appropriate event type so Zoom alerts us when you happens. In this particular case when a meeting recording is complete.
That is, when zoom has finished processing the recorded meeting in their cloud and sends us the event so we can download it.

