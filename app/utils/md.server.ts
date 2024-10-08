import themeJson from "@/styles/base16.json";
import { transformerCopyButton } from "@rehype-pretty/transformers";
/*!
 * Adapted from https://github.com/remix/remix-website
 *
 * Uses unified, remark, and rehype to process markdown content.
 */
import parseFrontMatter from "front-matter";
import type * as Unified from "unified";
import type * as Unist from "unist";
export interface ProcessorOptions {
	resolveHref?(href: string): string;
}

let processor: Awaited<ReturnType<typeof getProcessor>>;
export async function processMarkdown(content: string, options?: ProcessorOptions) {
	processor = processor || (await getProcessor(options));
	const { attributes, body: raw } = parseFrontMatter(content);
	const vfile = await processor.process(raw);
	const html = vfile.value.toString();
	return { attributes, raw, html };
}

export async function getProcessor(options?: ProcessorOptions) {
	const [
		{ unified },
		{ default: remarkGfm },
		{ default: remarkParse },
		{ default: remarkRehype },
		{ default: rehypeSlug },
		{ default: rehypeStringify },
		{ default: rehypeAutolinkHeadings },
		{ default: rehypePrettyCode },
		plugins,
	] = await Promise.all([
		import("unified"),
		import("remark-gfm"),
		import("remark-parse"),
		import("remark-rehype"),
		import("rehype-slug"),
		import("rehype-stringify"),
		import("rehype-autolink-headings"),
		import("rehype-pretty-code"),
		loadPlugins(),
	]);

	// The theme actually stores #FFFF${base-16-color-id} because vscode-textmate
	// requires colors to be valid hex codes, if they aren't, it changes them to a
	// default, so this is a mega hack to trick it.
	const themeString = JSON.stringify(themeJson).replace(/#FFFF(.{2})/g, "var(--base$1)");

	return unified()
		.use(remarkParse)
		.use(plugins.stripLinkExtPlugin, options)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeStringify, { allowDangerousHtml: true })
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings)
		.use(rehypePrettyCode, {
			keepBackground: false,
			theme: JSON.parse(themeString),
			// Needed if the documentation you are using has different meta strings
			// TODO: turn this into optional externalised
			// filterMetaString: (str) => str.replace(/lines=\[([^]*)\]/g, '{$1}').replace(/filename=([^ ]*)/g, 'title="$1"'),
			transformers: [
				transformerCopyButton({
					visibility: "always",
					feedbackDuration: 3_000,
					copyIcon:
						"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='rgb(9, 9, 11)' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5'%3E%3Crect width='13' height='13' x='9' y='9' rx='2' ry='2' vector-effect='non-scaling-stroke'/%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E",
					successIcon:
						"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='rgb(9, 9, 11)' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5'%3E%3Cpath d='M20 6 9 17l-5-5' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E",
				}),
			],
		});
}

type InternalPlugin<Input extends string | Unist.Node | undefined, Output> = Unified.Plugin<
	[ProcessorOptions?],
	Input,
	Output
>;

export async function loadPlugins() {
	const [{ visit, SKIP }, { htmlEscape }] = await Promise.all([import("unist-util-visit"), import("escape-goat")]);

	const stripLinkExtPlugin: InternalPlugin<UnistNode.Root, UnistNode.Root> = (options = {}) => {
		return async function transformer(tree: UnistNode.Root) {
			visit(tree, "link", (node, index, parent) => {
				if (options.resolveHref && typeof node.url === "string" && isRelativeUrl(node.url)) {
					if (parent && index != null) {
						parent.children[index] = {
							...node,
							url: options.resolveHref(node.url),
						};
						return SKIP;
					}
				}
			});
		};
	};

	return {
		stripLinkExtPlugin,
	};
}

////////////////////////////////////////////////////////////////////////////////

function isRelativeUrl(test: string) {
	// Probably fragile but should work well enough.
	// It would be nice if the consumer could provide a baseURI we could do
	// something like:
	// new URL(baseURI).origin === new URL(test, baseURI).origin
	const regexp = /^(?:[a-z]+:)?\/\//i;
	return !regexp.test(test);
}

////////////////////////////////////////////////////////////////////////////////

export namespace UnistNode {
	export type Content = Flow | Phrasing | Html;
	export interface Root extends Unist.Parent {
		type: "root";
		children: Flow[];
	}

	export type Flow = Blockquote | Heading | ParagraphNode | Link | Pre | Code | Image | Element | Html;

	export interface Html extends Unist.Node {
		type: "html";
		value: string;
	}

	export interface Element extends Unist.Parent {
		type: "element";
		tagName?: string;
	}

	export interface CodeElement extends Element {
		tagName: "code";
		data?: {
			meta?: string;
		};
		properties?: {
			className?: string[];
		};
	}

	export interface PreElement extends Element {
		tagName: "pre";
	}

	export interface Image extends Unist.Node {
		type: "image";
		title: null;
		url: string;
		alt?: string;
	}

	export interface Blockquote extends Unist.Parent {
		type: "blockquote";
		children: Flow[];
	}

	export interface Heading extends Unist.Parent {
		type: "heading";
		depth: number;
		children: UnistNode.Phrasing[];
	}

	interface ParagraphNode extends Unist.Parent {
		type: "paragraph";
		children: Phrasing[];
	}

	export interface Pre extends Unist.Parent {
		type: "pre";
		children: Phrasing[];
	}

	export interface Code extends Unist.Parent {
		type: "code";
		value?: string;
		lang?: any; //Shiki.Lang;
		meta?: string | string[];
	}

	export type Phrasing = Text | Emphasis;

	export interface Emphasis extends Unist.Parent {
		type: "emphasis";
		children: Phrasing[];
	}

	export interface Link extends Unist.Parent {
		type: "link";
		children: Flow[];
		url?: string;
	}

	export interface Text extends Unist.Literal {
		type: "text";
		value: string;
	}
}
