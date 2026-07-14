export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL === undefined
    ? process.env.NODE_ENV === "production"
      ? ""
      : "http://127.0.0.1:8000"
    : process.env.NEXT_PUBLIC_API_URL;

export type RegisterUserPayload = {
  user_type: "student" | "teacher" | "staff";
  name: string;
  email: string;
  password: string;
  university_id: string;
  department: string;
  extra: string;
};

export type RegisterUserResponse = {
  role: string;
  name: string;
  email: string;
  university_id: string;
  dashboard_route: string;
  collection_name: string;
  welcome_message: string;
  inserted_id: string | null;
  database_saved: boolean;
};

export type LoginPayload = {
  user_type: "student" | "teacher" | "staff";
  email: string;
  university_id: string;
  password: string;
};

export type LoginResponse = {
  role: string;
  name: string;
  email: string;
  university_id: string;
  dashboard_route: string;
  message: string;
};

export type NoticeStudent = {
  student_id: string;
  name: string;
  email: string;
  enrolled: boolean;
  notification_count: number;
  latest_notification: string | null;
};

export type NoticeBoardResponse = {
  classroom_id: string;
  notice_count: number;
  enrolled_student_count: number;
  students: NoticeStudent[];
};

export type StudentNoticeBoardResponse = {
  classroom_id: string;
  student: NoticeStudent;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function registerUser(payload: RegisterUserPayload) {
  return request<RegisterUserResponse>("/api/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return request<LoginResponse>("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getNoticeBoard(classroomId: string) {
  return request<NoticeBoardResponse>(`/api/classrooms/${classroomId}/notice-board`);
}

export function getStudentNoticeBoard(classroomId: string, studentId: string) {
  return request<StudentNoticeBoardResponse>(
    `/api/classrooms/${classroomId}/students/${studentId}/notice-board`,
  );
}

export function publishNotice(classroomId: string, title: string, message: string) {
  return request<NoticeBoardResponse>(`/api/classrooms/${classroomId}/notices`, {
    method: "POST",
    body: JSON.stringify({
      title,
      message,
      posted_by: "Course Teacher",
    }),
  });
}
