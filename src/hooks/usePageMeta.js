import { useEffect } from 'react';

export function usePageMeta(title, description, noIndex = false) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.content;
    document.title = `${title} | Adena Reis Vanrika`;
    if (meta && description) meta.content = description;
    const previousRobots = document.querySelector('meta[name="robots"]');
    const robots = previousRobots || document.createElement('meta');
    const previousRobotsValue = robots.content;
    if (noIndex) { robots.name = 'robots'; robots.content = 'noindex, nofollow'; if (!previousRobots) document.head.appendChild(robots); }
    return () => { document.title = previousTitle; if (meta) meta.content = previousDescription; if (noIndex) { if (!previousRobots) robots.remove(); else robots.content = previousRobotsValue; } };
  }, [title, description, noIndex]);
}
