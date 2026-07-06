const apitestDirective = {
  name: 'apitest',
  doc: 'Register two case-distinct API targets with verbatim identifiers',
  arg: { type: String },
  run() {
    const mk = (name, kind) => ({
      type: 'div',
      kind,
      identifier: name,
      html_id: name,
      children: [
        { type: 'paragraph', children: [{ type: 'inlineCode', value: name }, { type: 'text', value: ` (${kind})` }] },
      ],
    });
    return [mk('sample.Match', 'py:class'), mk('sample.match', 'py:function')];
  },
};
const plugin = { name: 'apitest', directives: [apitestDirective] };
export default plugin;
