---
title: "So I created a blog..."
date: "2020-03-14"
tag: ["gatsby","blog","Serverless"]
---

# The question
It all started with a question : **"How can I lower my monthly consuption?"**, sure enough I get this kind of question quite a lot and there's nothing really special about it. Except that this time the site the client had was a newspaper all created a classical CMS : Drupal (drupal.org). Drupal had been around for years and it's a reliable platform indeed, my first advice was to try to see how I could decouple a little of his setup.

## Setup

It was a very simple setup with a CDN (external to AWS), a load balancer, two servers (with Drupal) and a RDS Database.
![Diagram](/imgs/drupal.png)
No big deal, so far. The problem there was that anything I could suggest would be stuck to the fact that the system is basically a monolyth and drupal being written in php doesn't leave me with many options other than changing the technology (Who still uses php anyway?). I could actually suggest going with containers and save on Compute part (roughly 40% of his bill) and save him some bucks. 
But looking further into the situation we also found and apparent memory leak on his custom Drupal code, at least from the database perpective. Reviewing the memory consuption reveled spikes of memory after running the site for almost 2 hours or so. The client ended up creating a custom script to clean the sessions on the database and make it run smoothly again.
Containirizing this application wouldn´t do much as the leak would still linger and we still would need a database that size to run the whole stack. I guess I forgot to mention that there's been an attempt to downsize de DB Instance before. On the week before I was presented with this problem and they had to rollback since the small database couldn't handle load. The memory peaks were there and the drupal would bring RDS to its knees.

## Google to the rescue
My first google search led me to a very interesting [site](https://dri.es/how-to-decouple-drupal-in-2019) where it sparked me the idea of creating a statical website. Sure enough I was excited to tell the client the good news, that is, we could turn his website into a statically published kind of blog with a very simple addition of a plugin where we would need a minimal database just persist the articles at publishing time and minimal compute and then I could help him to draw a flow and problem solved, right?
After that it would be a very standard statical site that be hosted on S3 with no issues and very little effort, problem solved.

## Not really
It turned out that the client had already tried that and his version of drupal was not compatible with the aforementioned plugin(in his words), a dead end. Two months went by and I came accross with [Ghost](https://ghost.org) which is a real blog/cms system with a full blown API schema allowing you to create a headless cms. This would be perfect to create a very robust backend to this guy. 
The only piece missing would be creating a frontend and ghost's website document a possible solution with Gatsby (It was the first time I heard about it, actually). It turns out that there's a whole community around it [Gastby + Ghost](https://gatsby.ghost.org/). Obviously, I showed the client this **new** solution and, of course, it involved way lot more effort than he was wanting to put on it.

## Result
I wasn't able to please this guy and find him a solution that would meet his constrains, that is a full featured, out-of-the box CMS with no/little effort to customize. On one hand he had this buggy memory leaking Drupal website with would do no good rehosting or something of that kind.
On the other hand, he didn't want to get his hands dirty and developing a front end (using Gatsby, maybe) to take full advantage of Ghost which by the way had features he wanted in Drupal.
This was failure from a customer perpective, however, the concepts behind [GraphQL](https://graphql.org/) never made sense until I actually started reading the **get started** with Gatsby and their fantastic tutorial. This tutorial gave me the weapons I needed to create a blog that is 100% static yet generating dynamic pages (such as this one) with a single command.

## The End

Gatsby tutorial opened my eyes how I could, leveraging GraphQL, use static text files (.md) together with a build command a repository create a blog that would neve need a database to run on and very cheap to operate on AWS (and many other providers for that effect) thanks to the challendge this guy made me. I never completed his challenge but unknowingly he taught me 2 very cool concepts which I am putting into pratice.
That's how this site was born.