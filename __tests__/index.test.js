import { render, screen } from '@testing-library/react'
import Card from '../components/card'
import '@testing-library/jest-dom'

// Unit Test Per Component

describe('Card Component', () => {
  it('renders a heading', () => {
    render(<Card />)
    expect(screen.getByTestId("user")).toBeInTheDocument();
    expect(screen.getByTestId("image")).toBeInTheDocument();
    expect(screen.getByTestId("buttons")).toBeInTheDocument();
    expect(screen.getByTestId("caption")).toBeInTheDocument();
  })
})

