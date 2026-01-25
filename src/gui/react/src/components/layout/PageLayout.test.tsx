import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageLayout } from './PageLayout';

describe('PageLayout', () => {
  it('renders children', () => {
    render(
      <PageLayout>
        <p>Page content</p>
      </PageLayout>
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <PageLayout title="Test Page">
        Content
      </PageLayout>
    );
    expect(screen.getByRole('heading', { name: 'Test Page' })).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PageLayout actions={<button>Action</button>}>
        Content
      </PageLayout>
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('shows loading overlay when loading', () => {
    render(
      <PageLayout loading>
        Content
      </PageLayout>
    );
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies opacity to content when loading', () => {
    const { container } = render(
      <PageLayout loading>
        <p>Content</p>
      </PageLayout>
    );
    // The content wrapper should have opacity class when loading
    const contentWrapper = container.querySelector('.opacity-50');
    expect(contentWrapper).toBeInTheDocument();
  });

  it('does not show loading overlay when not loading', () => {
    render(
      <PageLayout loading={false}>
        Content
      </PageLayout>
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders as main element', () => {
    render(
      <PageLayout>
        Content
      </PageLayout>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders title and actions together', () => {
    render(
      <PageLayout title="Dashboard" actions={<button>Refresh</button>}>
        Content
      </PageLayout>
    );
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });
});
