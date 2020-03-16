import React from "react"
import { Link } from "gatsby"
import { css } from "@emotion/core"

import { rhythm } from "../utils/typography"

const ListLink = props => (
    <li style={{ display: `inline-block`, marginRight: `1rem` }}>
      <Link to={props.to}>{props.children}</Link>
    </li>
  )

export default ({ children }) => (
  <div style={{ margin: `3rem auto`, maxWidth: 1200, padding: `0 1rem` }}>
    <header style={{ marginBottom: `1.5rem` }}>
      <Link to="/" style={{ textShadow: `none`, backgroundImage: `none` }}>
        <h3 style={{ display: `inline` }}>Felipe's Blog</h3>
      </Link>
      <ul style={{ listStyle: `none`, float: `right` }}>
        <ListLink to="/">Home</ListLink>
        <ListLink to="/about">About</ListLink>
      </ul>
    </header>
    {children}
    </div>
)