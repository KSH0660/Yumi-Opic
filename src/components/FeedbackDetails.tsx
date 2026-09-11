"use client";

import { useMemo } from "react";
import { hasAnswerText, sameSpokenText } from "@/lib/answers";
import { diffAnswers, type DiffPiece } from "@/lib/answerDiff";
import {
  feedbackCategoryLabel,
  feedbackRewrite,
  requiresFrontLoadedOpening,
  type FeedbackCategory,
  type OpicFeedback,
  type OpicFeedbackItem,
} from "@/lib/feedback";
import {
  draftId,
  expressionFromFeedbackItem,
  expressionFromOverall,
  type ExpressionContext,
  type ExpressionDraft,
} from "@/lib/expressions";
import { SaveExpressionButton } from "./SavedExpressions";

/** 조언을 ☆ 로 저장하는 데 필요한 것. 결과 화면만 넘기고, 모아보기·인쇄에서는 버튼을 그리지 않는다. */
export interface ExpressionControls {
  context: ExpressionContext;
  savedIds: ReadonlySet<string>;
  onToggle: (draft: ExpressionDraft) => void;
  error: string | null;
}

/**
 * 스토리 흐름에 해당하는 유형은 강조색으로, 전달·발음·문법은 차분한 색으로 칠한다.
 * 코칭이 흐름을 먼저 보고 문법을 마지막에 본다는 우선순위를 색으로도 드러낸다.
 */
const FLOW_CATEGORIES: ReadonlySet<FeedbackCategory> = new Set(["storytelling", "detail", "emotion"]);

const DELETED = "rounded-sm bg-danger-tint px-0.5 text-danger-ink line-through decoration-danger-ink/60 box-decoration-clone";
const INSERTED = "rounded-sm bg-success-tint px-0.5 font-medium text-success-ink no-underline box-decoration-clone";

/**
 * AI 피드백 한 문항 분량. 결과 화면과 피드백 모아보기가 함께 쓴다.
 *
 * 총평과 흐름 점검 → 고칠 점 → Before / After 순서다. 무엇이 문제인지 먼저 읽고,
 * 그것을 내 답변에 반영하면 어디가 달라지는지 바로 아래에서 확인하게 한다.
 */
export default function FeedbackDetails({ feedback, questionType, answer, expressions }: {
  feedback: OpicFeedback;
  /** 롤플레이는 두괄식을 요구하지 않아 첫 흐름 단계의 이름이 바뀐다. */
  questionType: string;
  /** 지금 화면에 보이는 답변. Before 가 이와 다르면(브라우저 받아쓰기로 되돌린 경우 등) 한 줄로 알린다. */
  answer?: string;
  expressions?: ExpressionControls;
}) {
  const frontLoaded = requiresFrontLoadedOpening(questionType);
  const overallDraft = expressions && expressionFromOverall(feedback, expressions.context);
  const rewrite = feedbackRewrite(feedback);
  const items = feedback.items.slice(0, 5);

  return (
    <div className="space-y-6">
      <section aria-label="총평" className="rounded-xl bg-primary-tint px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <p className="pt-1 text-[11px] font-semibold tracking-widest text-primary-ink">총평</p>
          {overallDraft && expressions && (
            <SaveExpressionButton draft={overallDraft} saved={expressions.savedIds.has(draftId(overallDraft))} onToggle={expressions.onToggle} />
          )}
        </div>
        <p className="mt-1.5 text-sm font-medium leading-relaxed text-fg">{feedback.overall}</p>
        <ol aria-label="답변 흐름 점검" className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2">
          <FlowStep label={frontLoaded ? "두괄식 도입" : "요청·문제 전달"} good={feedback.structure.topic === "good"} />
          <FlowStep label="활동·디테일" good={feedback.structure.detail === "good"} arrow />
          <FlowStep label="감정·의미" good={feedback.structure.feeling === "good"} arrow />
        </ol>
        {feedback.structure.note && <p className="mt-2.5 text-xs leading-relaxed text-fg-muted">{feedback.structure.note}</p>}
        {expressions?.error && <p role="alert" className="mt-2 text-xs text-warn-ink">{expressions.error}</p>}
      </section>

      <section aria-label="고칠 점">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-sm font-semibold text-fg">{items.length ? `고칠 점 ${items.length}가지` : "고칠 점"}</h3>
          {items.length > 1 && <p className="text-[11px] text-fg-subtle">전달력에 영향이 큰 것부터</p>}
        </div>
        {items.length ? (
          <ol className="mt-2.5 space-y-2.5">
            {items.map((detail, index) => (
              <FeedbackItem key={`${detail.category}-${index}`} detail={detail} index={index} expressions={expressions} />
            ))}
          </ol>
        ) : (
          <p className="mt-2 rounded-xl bg-surface-2 px-3.5 py-3 text-xs text-fg-muted">지금 답변에서 꼭 고칠 만한 큰 문제는 찾지 않았습니다.</p>
        )}
      </section>

      {rewrite && <RewriteCompare before={rewrite.before} after={rewrite.after} answer={answer} />}

      <div className="space-y-1 border-t border-line pt-3 text-[11px] leading-relaxed text-fg-subtle">
        <p>
          {feedback.pronunciationBasis === "audio_compare"
            ? "발음 항목은 녹음본을 별도로 재전사해 브라우저 받아쓰기와 비교한 점검 신호입니다. 두 음성인식 모두 틀릴 수 있으므로 확정 판정으로 보지는 마세요."
            : "별도 녹음 재전사가 없으면 텍스트만 보고 발음 오류를 추정하지 않습니다."}
        </p>
        {expressions && <p>☆ 저장을 누른 조언은 같은 문항이나 같은 주제를 다시 풀 때 연습 도구에 나옵니다.</p>}
      </div>
    </div>
  );
}

function FlowStep({ label, good, arrow = false }: { label: string; good: boolean; arrow?: boolean }) {
  return (
    <li className="flex items-center gap-1.5">
      {arrow && <span aria-hidden="true" className="text-xs text-fg-subtle">→</span>}
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${good ? "bg-success-tint text-success-ink ring-success-ink/30" : "bg-warn-tint text-warn-ink ring-warn-ink/30"}`}>
        <span aria-hidden="true">{good ? "✓" : "△"}</span>
        {label} {good ? "좋음" : "보강"}
      </span>
    </li>
  );
}

function FeedbackItem({ detail, index, expressions }: {
  detail: OpicFeedbackItem;
  index: number;
  expressions?: ExpressionControls;
}) {
  const draft = expressions && expressionFromFeedbackItem(detail, expressions.context);
  const flow = FLOW_CATEGORIES.has(detail.category);
  return (
    <li className="rounded-xl bg-surface-2 px-3.5 py-3">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface text-[11px] font-semibold tabular-nums text-fg-muted ring-1 ring-inset ring-line">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${flow ? "bg-primary-tint text-primary-ink" : "bg-surface-3 text-fg-muted"}`}>
            {feedbackCategoryLabel[detail.category]}
          </span>
          <p className="mt-1.5 text-sm font-semibold leading-snug text-fg">{detail.title}</p>
          {detail.message && <p className="mt-1 text-xs leading-relaxed text-fg-muted">{detail.message}</p>}
          {detail.example && (
            <div className="mt-2.5 rounded-lg border-l-2 border-primary bg-surface px-3 py-2">
              <p className="text-[10px] font-semibold tracking-wider text-primary-ink">이렇게 말해 보세요</p>
              <p lang="en" className="mt-0.5 text-sm leading-relaxed text-fg">{detail.example}</p>
            </div>
          )}
        </div>
        {draft && expressions && (
          <SaveExpressionButton draft={draft} saved={expressions.savedIds.has(draftId(draft))} onToggle={expressions.onToggle} />
        )}
      </div>
    </li>
  );
}

/**
 * 내가 말한 답변과 피드백을 반영해 고친 답변을 나란히 두고 바뀐 단어만 칠한다.
 * Before 에는 빼거나 바꾼 말을, After 에는 새로 넣거나 바꾼 말을 표시한다.
 */
function RewriteCompare({ before, after, answer }: { before: string; after: string; answer?: string }) {
  const diff = useMemo(() => diffAnswers(before, after), [before, after]);
  const basisDiffers = answer !== undefined && hasAnswerText(answer) && !sameSpokenText(before, answer);

  return (
    <section aria-label="Before / After">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold text-fg">Before / After</h3>
        <p className="text-[11px] text-fg-subtle">{diff.changes ? `고친 곳 ${diff.changes}군데` : "고친 곳 없음"}</p>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-fg-muted">내가 말한 답변에 위 피드백만 반영했습니다. 스토리와 표현은 최대한 그대로 두었습니다.</p>

      {diff.changes === 0 ? (
        <p className="mt-2.5 rounded-xl bg-surface-2 px-3.5 py-3 text-xs text-fg-muted">피드백을 반영해도 고칠 곳이 거의 없는 답변입니다.</p>
      ) : (
        <>
          <div className="mt-2.5 space-y-2">
            <AnswerPanel label="Before" caption="내가 말한 답변" pieces={diff.before} />
            <AnswerPanel label="After" caption="피드백 반영" pieces={diff.after} after />
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-fg-subtle">
            <span><del className={DELETED}>취소선</del> 빼거나 바꾼 말</span>
            <span><ins className={INSERTED}>초록</ins> 새로 넣거나 바꾼 말</span>
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-fg-subtle">After 를 소리 내어 두세 번 읽어 본 뒤, 같은 질문에 다시 답해 보세요.</p>
        </>
      )}

      {basisDiffers && (
        <p className="mt-1 text-[11px] leading-relaxed text-fg-subtle">Before 는 AI 가 고칠 때 바탕으로 삼은 받아쓰기라 위의 내 답변과 조금 다를 수 있습니다.</p>
      )}
    </section>
  );
}

function AnswerPanel({ label, caption, pieces, after = false }: {
  label: string;
  caption: string;
  pieces: readonly DiffPiece[];
  after?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-3.5 py-3 ${after ? "border-success-ink/30 bg-surface" : "border-line bg-surface-2"}`}>
      <p className="text-[11px] font-semibold tracking-wide">
        <span className={after ? "text-success-ink" : "text-fg-muted"}>{label}</span>
        <span className="ml-1.5 font-normal text-fg-subtle">{caption}</span>
      </p>
      <p lang="en" className={`mt-1.5 whitespace-pre-wrap text-sm leading-relaxed ${after ? "text-fg" : "text-fg-muted"}`}>
        {pieces.map((piece, index) => !piece.changed
          ? <span key={index}>{piece.text}</span>
          : after
            ? <ins key={index} className={INSERTED}>{piece.text}</ins>
            : <del key={index} className={DELETED}>{piece.text}</del>)}
      </p>
    </div>
  );
}
