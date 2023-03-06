import { render } from '@testing-library/react'
import Card from '../components/card'
import Homepage from '../components/homepage'

jest.mock('next/router', () => ({
    useRouter: jest.fn()
}))

it('renders homepage unchanged', () => {
    const { container } = render(
        <Homepage />)
    expect(container).toMatchSnapshot()
})