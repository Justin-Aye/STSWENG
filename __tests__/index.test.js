import { render, screen, act, queryByTestId } from '@testing-library/react'
import React from 'react'
import Card from '../components/card'
import Navbar from '../components/navbar'
import Login from '../components/login'
import Signup from '../components/signup'
import Comment from '../components/comment'
import '@testing-library/jest-dom'

// Unit Test Per Component
import { useRouter } from 'next/router'


jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

let testUser = {
    uid: "IopbmgLpylVYmdPaJd17IE2vmXo2",
    data: {
        bio: "test_bio",
        commentIDs: [],
        disliked: [],
        email: "test_user@gmail.com",
        liked: [],
        postsID: [],
        profPic: "/images/user_icon.png",
    }
}

let testPostNoImg = {
    caption: "test_caption",
    commentsID: ["PgoUx3f7bZwu4kyuhLKv"],
    creatorID: "0EwHZIpo6geeTFa7WJooJmT1hDX2",
    dislikes: 0,
    imageSrc: "",
    likes: 0,
    userPic: "/images/user_icon.png"
}

let testPostImg = {
    caption: "test_caption",
    commentsID: ["PgoUx3f7bZwu4kyuhLKv"],
    creatorID: "0EwHZIpo6geeTFa7WJooJmT1hDX2",
    dislikes: 0,
    imageSrc: "/images/mountain.jpg",
    likes: 0,
    userPic: "/images/user_icon.png"
}

let testItem = {
    commentData: {
        comment: "test_comment",
        creator: "0EwHZIpo6geeTFa7WJooJmT1hDX2",
        dislikes: 0,
        likes: 0
    },
    commentID: "PgoUx3f7bZwu4kyuhLKv",
    userData: testUser.data
}

let testPostID = "QRG4vLVUbxUcMhHFaWhy"


describe('Card Component', () => {
  it('renders a post with no image', async () => {
    await act( async () => render(
        <Card currUser={testUser} post={testPostNoImg} profpic={testUser.data.profPic} postID={testPostID}/>
    ))
    expect(screen.getByTestId("user_container")).toBeInTheDocument();
    expect(screen.queryByTestId("image")).not.toBeInTheDocument();
    expect(screen.getByTestId("buttons_container")).toBeInTheDocument();
    expect(screen.getByTestId("caption")).toBeInTheDocument();
  })
})

describe('Card Component', () => {
    it('renders a post with an image', async () => {
      await act( async () => render(
          <Card currUser={testUser} post={testPostImg} profpic={testUser.data.profPic} postID={testPostID}/>
      ))
      expect(screen.getByTestId("user_container")).toBeInTheDocument();
      expect(screen.getByTestId("image")).toBeInTheDocument();
      expect(screen.getByTestId("buttons_container")).toBeInTheDocument();
      expect(screen.getByTestId("caption")).toBeInTheDocument();
    })
  })



describe("Comment Component", () => {
    it("renders a comment", async () => {
        await act( async () => render(
            <Comment index={0} currUser={testUser} item={testItem} postID={testPostID}/>
        ))
    expect(screen.getByTestId("comment_container")).toBeInTheDocument();
    //TODO:
})
} )

describe('Navbar Component', () => {
  it('renders a heading', () => {
    useRouter.mockReturnValue({ query: {}})
    render(<Navbar />)
    expect(screen.getByTestId("nav_container")).toBeInTheDocument();
    expect(screen.getByTestId("signup_link")).toBeInTheDocument();
    expect(screen.getByTestId("login_link")).toBeInTheDocument();
  })
})

describe('Signup Component', () => {
  it('renders title, form, and submit button', async () => {
    useRouter.mockReturnValue({ query: {}})
    await act( async () => render(<Signup />));
    expect(screen.getByTestId("page_title")).toBeInTheDocument();
    expect(screen.getByTestId("email_input")).toBeInTheDocument();
    expect(screen.getByTestId("pass_input")).toBeInTheDocument();
    expect(screen.getByTestId("rep_pass_input")).toBeInTheDocument();
    expect(screen.getByTestId("submit_btn")).toBeInTheDocument();
  })
})

describe('Login Component', () => {
  it('renders title, form, and submit button', async () => {
    useRouter.mockReturnValue({ query: {}})
    await act( async () => render(<Login />));
    expect(screen.getByTestId("page_title")).toBeInTheDocument();
    expect(screen.getByTestId("email_input")).toBeInTheDocument();
    expect(screen.getByTestId("pass_input")).toBeInTheDocument();
    expect(screen.getByTestId("submit_btn")).toBeInTheDocument();
  })
})
