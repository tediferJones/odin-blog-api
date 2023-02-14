# odin-blog-api

A simple blogging API, that allows the owner access to editing tools

Typical users should only be allowed to view Public posts, and make new comments

The owner, can CRUD all posts, including the ability to change a post from public to private, or vice versa.
    - If a post has been edited, the post should show the original post date, as well as the most recent date it was edited (changing a post from public/private does not trigger this)
    - Owner should not be able to edit other peoples comments, but they can delete them
    - We could allow comments to be edited by the original poster, but then every user who wants to comment would need to create an account and/or login
