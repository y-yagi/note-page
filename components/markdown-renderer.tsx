import React from "react";
import DOMPurify from "dompurify";
import { marked, type Tokens } from "marked";

interface Props {
  content: string;
}

const MarkdownRenderer = ({ content }: Props) => {
  // NOTE: see https://github.com/markedjs/marked/issues/655
  const renderer = new marked.Renderer();
  const linkRenderer = renderer.link.bind(renderer);
  renderer.link = (token: Tokens.Link) => {
    const href = token.href ?? "";
    const localLink = href.startsWith(
      `${location.protocol}//${location.hostname}`,
    );
    const html = linkRenderer(token);
    return localLink
      ? html
      : html.replace(
          /^<a /,
          `<a target="_blank" rel="noreferrer noopener nofollow" `,
        );
  };

  marked.setOptions({ breaks: true });

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(marked(content, { renderer }) as string, {
          ADD_ATTR: ["target"],
        }),
      }}
    ></div>
  );
};

export default MarkdownRenderer;
