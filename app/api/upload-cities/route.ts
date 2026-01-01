import { NextRequest, NextResponse } from 'next/server';
import { supabase, City } from '@/lib/supabase';
import * as xlsx from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('Upload cities API called, file:', file?.name);

    if (!file) {
      console.log('No file found in request');
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
    const requiredFields = ['city_name', 'year', 'base_min', 'base_max', 'rate'];
    const missingFields = requiredFields.filter(
      field => !Object.keys(data[0]).includes(field)
    );

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields, 'Available fields:', Object.keys(data[0]));
      return NextResponse.json(
        { error: `Excel 文件缺少必需字段: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 清空 cities 表
    const { error: deleteError } = await supabase
      .from('cities')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      return NextResponse.json(
        { error: '清空城市数据失败: ' + deleteError.message },
        { status: 500 }
      );
    }

    // 准备插入数据
    const citiesData: Omit<City, 'id'>[] = data.map(row => ({
      city_name: String(row.city_name),
      year: String(row.year),
      base_min: Number(row.base_min),
      base_max: Number(row.base_max),
      rate: Number(row.rate),
    }));

    // 插入数据
    const { error: insertError } = await supabase
      .from('cities')
      .insert(citiesData);

    if (insertError) {
      return NextResponse.json(
        { error: '插入城市数据失败: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功上传 ${citiesData.length} 条城市标准数据`,
      count: citiesData.length,
    });

  } catch (error) {
    console.error('上传城市数据时出错:', error);
    return NextResponse.json(
      { error: '上传过程中出现错误: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
