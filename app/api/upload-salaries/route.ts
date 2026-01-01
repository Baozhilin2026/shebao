import { NextRequest, NextResponse } from 'next/server';
import { supabase, Salary } from '@/lib/supabase';
import * as xlsx from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未找到上传文件' },
        { status: 400 }
      );
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: '只支持 Excel 文件格式 (.xlsx, .xls)' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const workbook = xlsx.read(arrayBuffer, { type: 'array' });

    // 获取第一个工作表
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // 转换为 JSON
    const data: any[] = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Excel 文件为空或格式不正确' },
        { status: 400 }
      );
    }

    // 验证必需字段
    const requiredFields = ['employee_id', 'employee_name', 'month', 'salary_amount'];
    const missingFields = requiredFields.filter(
      field => !Object.keys(data[0]).includes(field)
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Excel 文件缺少必需字段: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 清空 salaries 表
    const { error: deleteError } = await supabase
      .from('salaries')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      return NextResponse.json(
        { error: '清空工资数据失败: ' + deleteError.message },
        { status: 500 }
      );
    }

    // 准备插入数据
    const salariesData: Omit<Salary, 'id'>[] = data.map(row => ({
      employee_id: String(row.employee_id),
      employee_name: String(row.employee_name),
      month: String(row.month),
      salary_amount: Number(row.salary_amount),
    }));

    // 插入数据
    const { error: insertError } = await supabase
      .from('salaries')
      .insert(salariesData);

    if (insertError) {
      return NextResponse.json(
        { error: '插入工资数据失败: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功上传 ${salariesData.length} 条员工工资数据`,
      count: salariesData.length,
    });

  } catch (error) {
    console.error('上传工资数据时出错:', error);
    return NextResponse.json(
      { error: '上传过程中出现错误: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
