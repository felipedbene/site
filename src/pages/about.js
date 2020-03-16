import React from "react"
import Layout from "../components/layout"
import { Link } from "gatsby"



export default () => {
  return (
    <Layout>
      <h3>
        Opinions expressed are solely my own and do not express the views or
        opinions of my employer.
      </h3>
      <p>
        My Name is Felipe De Bene and I’m a Solutions Architect at Amazon Web
        Services and I never felt I learned so much and so little time in my
        life this blog is my attempt to share some of the lessons I’ve learned
        and document some of my experiments with this amazing technology.
      </p>
      <p>
        This blog is result of months of research and an attempt of documenting
        such research. The idea is obviously to keep documenting the best that I can,
        especially the bad ideas.
      </p>
      <p>
        It basically started off with a question : "How can I reduce my monthly
        bill?".I actually get this question more often than I would iniatilly
        imagine, but this time I decided to go real deep as the site was a
        classical CMS, Drupal to be more precise and I felt the pain as I always
        wanted to build myself a website and Drupal was an expensive way of
        doing that as I learned from his experience.{" "}
      </p>
      <p>
        I had to do some better than that and this is the result.All source code is
        available on <a href="https://github.com/felipedbene/site">github</a>{" "}
        and you can read the rest of the detailed journey <Link to="/so-i-created-a-blog/"> 
        on the first post </Link>.Also, you can drop me a note and/or me on <a href="https://www.linkedin.com/in/felipe-de-bene-47292943/" >LinkedIn.</a>
      </p>
    </Layout>
  )
}
