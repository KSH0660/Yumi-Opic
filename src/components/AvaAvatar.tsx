/**
 * 시험 화면 왼쪽의 면접관(Ava) 자리.
 *
 * `public/ava.jpg` 는 실제 오픽 응시 화면에 나오는 면접관 이미지다. 원본에 있는
 * 연한 테두리를 걷어내려고 살짝 확대해 꽉 채운다.
 *
 * `speaking` 이 켜지면 오른쪽 아래에 소리 표시가 움직인다. 사진은 입이 움직이지
 * 않으니, 지금 질문이 나오는 중인지 눈으로 알 수 있게 하려는 것이다.
 */
export default function AvaAvatar({ speaking = false }: { speaking?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-exam-frame-2">
      <img
        src="/ava.jpg"
        alt="면접관 화면"
        width={210}
        height={212}
        className="h-full w-full scale-[1.06] object-cover"
      />
      {speaking && (
        <span className="ava-wave absolute bottom-2 right-2 flex h-6 items-end gap-[3px] rounded bg-black/55 px-2 py-1.5">
          <span className="block h-3 w-[3px] rounded-full bg-white" />
          <span className="block h-3 w-[3px] rounded-full bg-white" />
          <span className="block h-3 w-[3px] rounded-full bg-white" />
        </span>
      )}
    </div>
  );
}
