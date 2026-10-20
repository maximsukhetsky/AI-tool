import { Editor } from "@/components/editor/Editor";

export default function EditorPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Editor</h1>
      <Editor />
    </section>
  );
}
