import { render, screen, act } from '@testing-library/react'
import React from 'react'
import Card from '../components/card'
import Navbar from '../components/navbar'
import Login from '../components/login'
import Signup from '../components/signup'
import '@testing-library/jest-dom'

// Unit Test Per Component
import { useRouter } from 'next/router'


jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('Card Component', () => {
  it('renders a heading', async () => {
    let currUser = {uid: "IopbmgLpylVYmdPaJd17IE2vmXo2", data: {}}
    let post = {data: {imageSrc: "/images/mountain.jpg"}, userData: {}}
    let profpic = "/images/user_icon.png"
    let postID = "sOrvV7JMNx13vPydnrXj"

    await act( async () => render(
        <Card currUser={currUser} post={post} profpic={profpic} postID={postID}/>
      /*<Card username={"Username"} caption={"Best Image"} imageSrc={"/images/mountain.jpg"} profpic={"/images/user_icon.png"}
        likes={0} dislikes={0} commentsID={[]} owner={"IopbmgLpylVYmdPaJd17IE2vmXo2"}
      />*/
    ))
    expect(screen.getByTestId("user_container")).toBeInTheDocument();
    expect(screen.getByTestId("image")).toBeInTheDocument();
    expect(screen.getByTestId("buttons_container")).toBeInTheDocument();
    expect(screen.getByTestId("caption")).toBeInTheDocument();
  })
})

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
