// Jest Snapshot v1, https://goo.gl/fbAQLP

jest.mock('next/router', () => ({
    useRouter: jest.fn()
}))

it('renders homepage unchanged', () => {
    const { container } = render(
        <Homepage />)
    expect(container).toMatchSnapshot()
})
