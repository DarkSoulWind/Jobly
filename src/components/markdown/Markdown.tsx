import React, { FC, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";
import remarkGfm, { Options as GfmOptions } from "remark-gfm";
import remarkGemoji from "remark-gemoji";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  gruvboxDark,
  gruvboxLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  HiClipboard,
  HiMoon,
  HiOutlineClipboard,
  HiOutlineMoon,
  HiOutlineSun,
  HiSun,
} from "react-icons/hi2";
import YoutubeMetadata from "./YoutubeMetadata";

/**
 * Custom markdown setup
 * @param  - `children` - The markdown content to be rendered.
 * @returns A React component that renders markdown.
 */
const Markdown: FC<ReactMarkdownOptions & { disabled?: boolean }> = ({
  disabled,
  children,
  className,
}) => {
  const [usingDark, setUsingDark] = useState(true);

  if (disabled) {
    return children;
  }

  return (
    <>
      <ReactMarkdown
        className={className}
        remarkPlugins={[
          [remarkGfm, { singleTilde: false } as GfmOptions],
          [remarkGemoji],
        ]}
        components={{
          img: ({ node, ...props }) => <p {...props}>{children}</p>,
          a: ({ node, ...props }) => {
            const [url] = useState(new URL(props.href!));

            return (
              <>
                <a
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  {...props}
                />

                {/* if the site is youtube and it is a video */}
                {url.origin === "https://www.youtube.com" &&
                  url.searchParams.has("v") && (
                    <YoutubeMetadata url={props.href!} />
                  )}
              </>
            );
          },
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const [copied, setCopied] = useState(false);

            return !inline && match ? (
              <div className="bg-slate-700 my-2 rounded-lg overflow-clip">
                <section className="flex justify-between h-5 items-center pt-4 pb-3 px-3">
                  {/* PROGRAMMING LANGUAGE */}
                  <p className="text-white font-sans text-xs">{match[1]}</p>

                  <div className="flex items-center justify-end gap-1">
                    {/* COPY TO CLIPBOARD */}
                    <button
                      className="p-1 rounded-lg bg-gray-700"
                      onClick={async () => {
                        // copy to clipboard
                        await navigator.clipboard.writeText(
                          String(children).replace(/\n$/, "")
                        );

                        setCopied(true);
                        setTimeout(() => {
                          setCopied(false);
                        }, 2000);
                      }}
                    >
                      {copied ? (
                        <p className="text-xs font-sans text-white">Copied!</p>
                      ) : (
                        <HiOutlineClipboard className="stroke-white" />
                      )}
                    </button>

                    {/* TOGGLE DARK MODE */}
                    <button
                      onClick={() => setUsingDark(!usingDark)}
                      className={"p-1 rounded-lg bg-gray-700"}
                    >
                      {usingDark ? (
                        <HiOutlineMoon className="stroke-white" />
                      ) : (
                        <HiOutlineSun className="stroke-white" />
                      )}
                    </button>
                  </div>
                </section>

                <span className="text-xs mt-3">
                  <SyntaxHighlighter
                    style={usingDark ? gruvboxDark : gruvboxLight}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {new String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </span>

                <div className="pt-6"></div>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </>
  );
};

export default Markdown;
