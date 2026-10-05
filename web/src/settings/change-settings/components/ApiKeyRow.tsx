export function ApiKeyRow() {
  return (
    <div className="row">
      <label className="row__label" htmlFor="setting-apiKey">
        Anthropic API Key
      </label>
      <input
        className="row__field"
        id="setting-apiKey"
        type="password"
        autoComplete="off"
        placeholder="sk-ant-…"
      />
      <button type="button" className="button" id="save-api-key" disabled>
        Save
      </button>
    </div>
  );
}
