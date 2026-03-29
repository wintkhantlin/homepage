export const siteConfig = {
  name: "Wint Khant Lin",
  siteName: "Wint Khant Lin",
  handle: "Happer",
  author: "Wint Khant Lin",
  role: "Software engineer",
  locale: "en_US",
  defaultTitle: "Wint Khant Lin | Software Engineering Portfolio, Projects, and Writing",
  defaultDescription:
    "Portfolio of Wint Khant Lin (Happer), a software engineering student from Myanmar sharing backend projects, systems thinking, web development experiments, and programming notes.",
  defaultKeywords: [
    "Wint Khant Lin",
    "Happer",
    "software engineer portfolio",
    "backend engineering",
    "systems programming",
    "web development",
    "programming blog",
    "software projects",
    "Myanmar developer",
  ],
  social: {
    github: "https://github.com/wintkhantlin",
    linkedin: "https://www.linkedin.com/in/wintkhantlin/",
    email: "mailto:wintkhantlin@gmail.com",
  },
  defaultImage: "/animation.gif",
};

export function dedupeKeywords(values: Array<string | undefined | null>) {
  return [...new Set(values.filter(Boolean).map((value) => value!.trim()))];
}

