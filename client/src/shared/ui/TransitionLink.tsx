import { forwardRef, type MouseEvent } from "react";
import { Link, type LinkProps, useNavigate } from "react-router-dom";

/**
 * Drop-in replacement for react-router's <Link> that reproduces the legacy
 * `initPageTransitions()` fade-out (js/core/core.js): adds `page-leaving` to
 * <body> and waits for the 200ms `pageOut` CSS animation before navigating.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(function TransitionLink(
  { to, onClick, ...rest },
  ref
) {
  const navigate = useNavigate();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (document.body.classList.contains("page-leaving")) return;

    e.preventDefault();
    document.body.classList.add("page-leaving");
    window.setTimeout(() => {
      document.body.classList.remove("page-leaving");
      navigate(to);
    }, 200);
  }

  return <Link ref={ref} to={to} onClick={handleClick} {...rest} />;
});
