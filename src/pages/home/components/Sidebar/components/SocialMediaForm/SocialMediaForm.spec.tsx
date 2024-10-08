import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SocialMediaForm from './SocialMediaForm';

const setIsOpenMock = (): boolean => false;

describe('Social Media Form', () => {
  it('renders correctly', () => {
    const { container } = render(
      <SocialMediaForm disabled onOpenModal={() => setIsOpenMock} />
    );

    expect(container).toBeDefined();
  });
  it('calls onClick prop when clicked', async () => {
    const handleClick = vi.fn();

    render(<SocialMediaForm disabled onOpenModal={handleClick} />);

    const [button] = screen.getAllByRole('button');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
