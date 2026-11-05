// Configuração padrão de todos os posts desta pasta
export default {
  layout: "layouts/post.njk",
  permalink: (data) => `/posts/${data.page.fileSlug}/`,
};
